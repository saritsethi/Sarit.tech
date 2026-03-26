/**
 * RAG retrieval — uses PostgreSQL full-text search (ts_rank) to find relevant chunks.
 * No embedding API required — runs entirely in the database.
 */

import { pool } from "@workspace/db";

export interface RetrievedChunk {
  sourceName: string;
  chunkText: string;
  rank: number;
}

const TOP_K = 5;
const MIN_RANK = 0.01;

/** Retrieve the top-k most relevant chunks for a given query using full-text search */
export async function retrieveContext(query: string): Promise<RetrievedChunk[]> {
  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM rag_chunks",
  );
  const count = parseInt(countResult.rows[0]?.count ?? "0", 10);
  if (count === 0) return [];

  // Use plainto_tsquery for natural language queries (handles stopwords, stemming)
  const result = await pool.query<{
    source_name: string;
    chunk_text: string;
    rank: number;
  }>(
    `SELECT source_name, chunk_text,
            ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
     FROM rag_chunks
     WHERE search_vector @@ plainto_tsquery('english', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [query, TOP_K],
  );

  return result.rows
    .filter((r) => r.rank >= MIN_RANK)
    .map((r) => ({
      sourceName: r.source_name,
      chunkText: r.chunk_text,
      rank: r.rank,
    }));
}

/** Format retrieved chunks as a prompt context block */
export function formatContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const entries = chunks
    .map(
      (c, i) =>
        `[Source: ${c.source_name} — Chunk ${i + 1}]\n${c.chunkText}`,
    )
    .join("\n\n---\n\n");

  return `═══════════════════════════════════════
RETRIEVED KNOWLEDGE (from personal documents — treat as ground truth)
═══════════════════════════════════════

${entries}

═══════════════════════════════════════
END OF RETRIEVED KNOWLEDGE
═══════════════════════════════════════`;
}
