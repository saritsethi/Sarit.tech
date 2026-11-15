/**
 * Vercel serverless entry point — serves the Express API at /api/*.
 *
 * Imports the app (not index.ts): no PORT is required, and the Sanity email
 * guard plus the 24h ingest scheduler are not started here — daily ingest
 * runs via Vercel Cron (see vercel.json) hitting GET /api/rag/ingest.
 */
import app from "../artifacts/api-server/src/app";

export default app;
