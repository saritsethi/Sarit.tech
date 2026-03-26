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
  const token = process.env["SANITY_API_TOKEN"];

  if (!projectId || !token) {
    logger.warn("[Sanity] SANITY_PROJECT_ID or SANITY_API_TOKEN not set — skipping email patch");
    return;
  }

  const CORRECT_EMAIL = "saritsethi@gmail.com";
  const DOC_ID = "singleton-siteSettings";

  try {
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2023-08-01/data/mutate/${dataset}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mutations: [{ patch: { id: DOC_ID, set: { emailAddress: CORRECT_EMAIL } } }],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      logger.warn({ status: res.status, body }, "[Sanity] Email patch returned non-OK response");
      return;
    }

    logger.info({ docId: DOC_ID, email: CORRECT_EMAIL }, "[Sanity] emailAddress patched successfully");
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

function scheduleRagIngest() {
  setTimeout(async () => {
    try {
      logger.info("[RAG] Starting scheduled ingest...");
      const result = await ingestRagDocuments();
      logger.info(
        { docs: result.documentsProcessed, chunks: result.chunksStored, errors: result.errors.length },
        "[RAG] Scheduled ingest complete"
      );
    } catch (err) {
      logger.error({ err }, "[RAG] Scheduled ingest failed");
    }
    setInterval(async () => {
      try {
        logger.info("[RAG] Starting scheduled ingest...");
        const result = await ingestRagDocuments();
        logger.info(
          { docs: result.documentsProcessed, chunks: result.chunksStored, errors: result.errors.length },
          "[RAG] Scheduled ingest complete"
        );
      } catch (err) {
        logger.error({ err }, "[RAG] Scheduled ingest failed");
      }
    }, INGEST_INTERVAL_MS);
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
