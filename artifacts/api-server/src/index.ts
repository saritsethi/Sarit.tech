import app from "./app";
import { logger } from "./lib/logger";
import { ingestRagDocuments } from "./rag/ingest";

// ---------------------------------------------------------------------------
// Sanity email guard — ensures emailAddress is always saritsethi@gmail.com.
// Runs once at startup; non-fatal if Sanity is unavailable.
// ---------------------------------------------------------------------------
async function patchSanityEmail(): Promise<void> {
  const projectId = process.env["SANITY_PROJECT_ID"];
  const dataset = process.env["SANITY_DATASET"] ?? "production";
  // Prefer SANITY_TOKEN (write token); fall back to SANITY_API_TOKEN
  const token = process.env["SANITY_TOKEN"] ?? process.env["SANITY_API_TOKEN"];

  if (!projectId || !token) {
    logger.warn("[Sanity] SANITY_PROJECT_ID or SANITY_TOKEN not set — skipping email patch");
    return;
  }

  const CORRECT_EMAIL = "saritsethi@gmail.com";
  const base = `https://${projectId}.api.sanity.io/v2023-08-01/data`;
  const authHeaders = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  try {
    // Step 1: Query for the actual document ID by type (avoids hardcoded ID assumption)
    const queryRes = await fetch(
      `${base}/query/${dataset}?query=${encodeURIComponent("*[_type==\"siteSettings\"][0]{_id,emailAddress}")}`,
      { headers: { "Authorization": `Bearer ${token}` } },
    );

    if (!queryRes.ok) {
      const body = await queryRes.text();
      logger.warn({ status: queryRes.status, body }, "[Sanity] siteSettings query failed — skipping email patch");
      return;
    }

    const { result } = (await queryRes.json()) as { result?: { _id?: string; emailAddress?: string } };

    if (!result?._id) {
      logger.warn("[Sanity] No siteSettings document found — skipping email patch");
      return;
    }

    if (result.emailAddress === CORRECT_EMAIL) {
      logger.info({ docId: result._id }, "[Sanity] emailAddress already correct — no patch needed");
      return;
    }

    // Step 2: Patch the document using its actual _id
    const mutateRes = await fetch(`${base}/mutate/${dataset}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        mutations: [{ patch: { id: result._id, set: { emailAddress: CORRECT_EMAIL } } }],
      }),
    });

    if (!mutateRes.ok) {
      const body = await mutateRes.text();
      logger.warn({ status: mutateRes.status, body }, "[Sanity] Email patch mutation returned non-OK response");
      return;
    }

    logger.info({ docId: result._id, email: CORRECT_EMAIL }, "[Sanity] emailAddress patched successfully");
  } catch (err) {
    logger.error({ err }, "[Sanity] Email patch failed — continuing startup");
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const INGEST_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function runIngest(): Promise<void> {
  try {
    logger.info("[RAG] Starting scheduled ingest...");
    const result = await ingestRagDocuments();
    logger.info(
      { docs: result.documentsProcessed, chunks: result.chunksStored, errors: result.errors.length },
      "[RAG] Scheduled ingest complete",
    );
  } catch (err) {
    logger.error({ err }, "[RAG] Scheduled ingest failed");
  }
}

function scheduleRagIngest() {
  // Initial run 60s after startup, then repeat every 24h
  setTimeout(() => {
    void runIngest();
    setInterval(() => void runIngest(), INGEST_INTERVAL_MS);
  }, 60_000);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  patchSanityEmail();
  scheduleRagIngest();
});
