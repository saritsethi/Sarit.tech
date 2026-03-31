/**
 * One-time backfill script: send all existing unsynced user chat messages
 * to PostHog as historical `chatbot_query` events, timestamped to their
 * original created_at so they appear at the correct point in the timeline.
 *
 * Run once from the workspace root:
 *   node artifacts/api-server/scripts/backfill-posthog.mjs
 *
 * Safe to re-run: already-synced rows (posthog_synced = true) are skipped.
 *
 * Properties derived per message:
 * - isNewConversation: true only for the first user message per conversation
 * - isOutOfScope: derived from the assistant reply immediately following this
 *   user message (not the latest reply in the conversation)
 * - responseLengthChars: length of that same immediately-following reply
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const requireFromDb = createRequire(resolve(__dirname, "../../../lib/db/package.json"));
const requireFromServer = createRequire(resolve(__dirname, "../package.json"));

const { Client } = requireFromDb("pg");
const { PostHog } = requireFromServer("posthog-node");

const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = "https://us.i.posthog.com";
const REFUSAL_PHRASE = "I don't have that specific data in my current knowledge base";

if (!POSTHOG_KEY) {
  console.error("ERROR: VITE_POSTHOG_KEY environment variable is not set.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
const posthog = new PostHog(POSTHOG_KEY, {
  host: POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
});

async function run() {
  await client.connect();
  console.log("[backfill] Connected to DB");

  // Single query that:
  // 1. Identifies only unsynced user messages
  // 2. Computes isNewConversation via window function (first per conversation)
  // 3. Pairs each user message with the assistant reply immediately following it
  const { rows } = await client.query(`
    SELECT
      m.id,
      m.conversation_id,
      m.content       AS user_content,
      m.created_at,
      (ROW_NUMBER() OVER (
        PARTITION BY m.conversation_id
        ORDER BY m.created_at ASC, m.id ASC
      ) = 1)          AS is_new_conversation,
      (
        SELECT a.content
        FROM messages a
        WHERE a.conversation_id = m.conversation_id
          AND a.role = 'assistant'
          AND (
            a.created_at > m.created_at
            OR (a.created_at = m.created_at AND a.id > m.id)
          )
        ORDER BY a.created_at ASC, a.id ASC
        LIMIT 1
      )               AS assistant_content
    FROM messages m
    WHERE m.role = 'user'
      AND m.posthog_synced = false
    ORDER BY m.created_at ASC, m.id ASC
  `);

  console.log(`[backfill] ${rows.length} unsynced user messages to process`);
  if (rows.length === 0) {
    console.log("[backfill] Nothing to do — all messages already synced.");
    await cleanup();
    return;
  }

  let succeeded = 0;
  let failed = 0;

  for (const msg of rows) {
    const convIdStr = msg.conversation_id.toString();
    const assistantContent = msg.assistant_content ?? "";
    const isOutOfScope = assistantContent.includes(REFUSAL_PHRASE);

    try {
      posthog.capture({
        distinctId: `conversation-${convIdStr}`,
        event: "chatbot_query",
        timestamp: new Date(msg.created_at),
        properties: {
          query: msg.user_content,
          conversationId: convIdStr,
          isNewConversation: msg.is_new_conversation,
          isOutOfScope,
          responseLengthChars: assistantContent.length || null,
          backfilled: true,
        },
      });

      // Only mark synced after successful capture call
      await client.query(
        "UPDATE messages SET posthog_synced = true WHERE id = $1",
        [msg.id]
      );

      console.log(
        `[backfill] ✓ msg ${msg.id} | new: ${msg.is_new_conversation} | oos: ${isOutOfScope} | "${msg.user_content.slice(0, 55)}"`
      );
      succeeded++;
    } catch (err) {
      console.error(`[backfill] ✗ msg ${msg.id} failed:`, err);
      failed++;
    }
  }

  console.log(`[backfill] Done. ${succeeded} sent, ${failed} failed.`);
  await cleanup();
}

async function cleanup() {
  await posthog.shutdown();
  await client.end();
}

run().catch(async (err) => {
  console.error("[backfill] Fatal error:", err);
  await cleanup().catch(() => {});
  process.exit(1);
});
