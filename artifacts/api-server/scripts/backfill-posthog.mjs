/**
 * One-time backfill script: send all existing unsynced user chat messages
 * to PostHog as historical `chatbot_query` events, timestamped to their
 * original created_at so they appear at the correct point in the timeline.
 *
 * Run once from the workspace root:
 *   node artifacts/api-server/scripts/backfill-posthog.mjs
 *
 * Safe to re-run: already-synced rows (posthog_synced = true) are skipped.
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

  const { rows } = await client.query(`
    SELECT id, conversation_id, content, created_at
    FROM messages
    WHERE role = 'user' AND posthog_synced = false
    ORDER BY created_at ASC
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

    const { rows: assistantRows } = await client.query(
      `SELECT content FROM messages
       WHERE conversation_id = $1 AND role = 'assistant'
       ORDER BY created_at DESC LIMIT 1`,
      [msg.conversation_id]
    );
    const assistantContent = assistantRows[0]?.content ?? "";
    const isOutOfScope = assistantContent.includes(REFUSAL_PHRASE);

    try {
      posthog.capture({
        distinctId: `conversation-${convIdStr}`,
        event: "chatbot_query",
        timestamp: new Date(msg.created_at),
        properties: {
          query: msg.content,
          conversationId: convIdStr,
          isNewConversation: true,
          isOutOfScope,
          responseLengthChars: assistantContent.length || null,
          backfilled: true,
        },
      });

      await client.query(
        "UPDATE messages SET posthog_synced = true WHERE id = $1",
        [msg.id]
      );

      console.log(
        `[backfill] ✓ msg ${msg.id} | out-of-scope: ${isOutOfScope} | "${msg.content.slice(0, 60)}"`
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
