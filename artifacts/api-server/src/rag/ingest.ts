/**
 * RAG ingestion pipeline — reads docs from Google Drive, chunks, and stores.
 * Uses PostgreSQL full-text search (tsvector) for retrieval — no embedding API needed.
 * Run via POST /api/rag/ingest.
 */

import { pool } from "@workspace/db";
import { fetchRagDocuments } from "./drive";
import { chunkText } from "./chunk";

export interface IngestResult {
  documentsProcessed: number;
  chunksStored: number;
  errors: string[];
  durationMs: number;
}

export async function ingestRagDocuments(): Promise<IngestResult> {
  const start = Date.now();
  const errors: string[] = [];
  let chunksStored = 0;

  console.log("[RAG] Starting ingestion from Google Drive...");

  const documents = await fetchRagDocuments();
  console.log(`[RAG] Fetched ${documents.length} documents from Drive`);

  // ── Step 1: Remove chunks for files that no longer exist in Drive ─────────
  const driveIds = new Set(documents.map((d) => d.id));
  const { rows: storedRows } = await pool.query<{ source_id: string }>(
    "SELECT DISTINCT source_id FROM rag_chunks",
  );
  const removedIds = storedRows.map((r) => r.source_id).filter((id) => !driveIds.has(id));

  if (removedIds.length > 0) {
    await pool.query("DELETE FROM rag_chunks WHERE source_id = ANY($1::text[])", [removedIds]);
    console.log(`[RAG] Removed chunks for ${removedIds.length} deleted file(s)`);
  }

  // ── Step 2: Upsert chunks for current Drive files ─────────────────────────
  for (const doc of documents) {
    try {
      // Delete old chunks for this file so edits are reflected
      await pool.query("DELETE FROM rag_chunks WHERE source_id = $1", [doc.id]);

      const chunks = chunkText(doc.text);

      for (const chunk of chunks) {
        await pool.query(
          `INSERT INTO rag_chunks (source_id, source_name, chunk_index, chunk_text)
           VALUES ($1, $2, $3, $4)`,
          [doc.id, doc.name, chunk.index, chunk.text],
        );
        chunksStored++;
      }

      console.log(`[RAG] ✓ ${doc.name}: ${chunks.length} chunks`);
    } catch (err) {
      const msg = `Failed to process ${doc.name}: ${
        err instanceof Error ? err.message : String(err)
      }`;
      console.error(`[RAG] ✗ ${msg}`);
      errors.push(msg);
    }
  }

  const durationMs = Date.now() - start;
  console.log(
    `[RAG] Ingestion complete — ${chunksStored} chunks stored in ${durationMs}ms`,
  );

  return { documentsProcessed: documents.length, chunksStored, errors, durationMs };
}
