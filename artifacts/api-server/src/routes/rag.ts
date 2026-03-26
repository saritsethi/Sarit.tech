/**
 * RAG management routes
 * POST /api/rag/ingest  — pull docs from Google Drive, chunk, embed, store
 * GET  /api/rag/status  — report on stored chunks
 */

import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { ingestRagDocuments } from "../rag/ingest";
import { listRagFiles } from "../rag/drive";

const router: IRouter = Router();

router.post("/rag/ingest", async (_req, res) => {
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
});

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
