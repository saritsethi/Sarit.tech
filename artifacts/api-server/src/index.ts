import app from "./app";
import { logger } from "./lib/logger";
import { ingestRagDocuments } from "./rag/ingest";

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
  scheduleRagIngest();
});
