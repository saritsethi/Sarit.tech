/**
 * RAG management routes
 * POST /api/rag/ingest  — pull docs from Google Drive, chunk, embed, store
 * GET  /api/rag/ingest  — same, for Vercel Cron (cron jobs issue GET requests)
 * GET  /api/rag/status  — report on stored chunks
 *
 * Ingest is guarded by CRON_SECRET when it is set: callers must send
 * `Authorization: Bearer <CRON_SECRET>` (what Vercel Cron sends) or
 * `x-cron-secret: <CRON_SECRET>`. When CRON_SECRET is unset (local dev),
 * ingest stays open as before.
 */

import {
  Router,
  type IRouter,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { pool } from "@workspace/db";
import { ingestRagDocuments } from "../rag/ingest";
import { listRagFiles } from "../rag/drive";

const router: IRouter = Router();

function requireCronSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    next();
    return;
  }
  const authHeader = req.headers.authorization ?? "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";
  const headerSecret = req.headers["x-cron-secret"];
  const provided =
    bearer || (typeof headerSecret === "string" ? headerSecret : "");
  if (provided !== secret) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  next();
}

async function runIngest(_req: Request, res: Response): Promise<void> {
  try {
    res.setHeader("Content-Type", "application/json");
    const result = await ingestRagDocuments();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("[RAG] Ingest error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Ingestion failed",
    });
  }
}

router.post("/rag/ingest", requireCronSecret, runIngest);
router.get("/rag/ingest", requireCronSecret, runIngest);

router.get("/rag/status", async (_req, res) => {
  try {
    const [chunkRows, fileList] = await Promise.all([
      pool.query<{ source_name: string; count: string }>(
        "SELECT source_name, COUNT(*)::text as count FROM rag_chunks GROUP BY source_name ORDER BY source_name",
      ),
      listRagFiles(),
    ]);

    const totalResult = await pool.query<{ total: string }>(
      "SELECT COUNT(*)::text as total FROM rag_chunks",
    );

    res.json({
      totalChunks: parseInt(totalResult.rows[0]?.total ?? "0", 10),
      driveFiles: fileList.length,
      bySource: chunkRows.rows.map((r) => ({
        name: r.source_name,
        chunks: parseInt(r.count, 10),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Status check failed" });
  }
});

export default router;
