import { sql } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Drizzle ORM has no built-in tsvector column type in the version used
// here (drizzle-orm 0.45), so define one with customType, following the
// Drizzle docs' full-text search example. search_vector is a stored
// generated column populated automatically from chunk_text: ingest
// inserts do not supply it, and retrieval queries it with
// plainto_tsquery / ts_rank.
const tsvector = customType<{ data: string; notNull: true; default: false }>({
  dataType() {
    return "tsvector";
  },
});

export const ragChunks = pgTable(
  "rag_chunks",
  {
    id: serial("id").primaryKey(),
    sourceId: text("source_id").notNull(),
    sourceName: text("source_name").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    chunkText: text("chunk_text").notNull(),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`to_tsvector('english', chunk_text)`,
      { mode: "stored" },
    ),
  },
  (table) => [
    index("rag_chunks_search_vector_idx").using("gin", table.searchVector),
    uniqueIndex("rag_chunks_source_id_chunk_index_unique").on(
      table.sourceId,
      table.chunkIndex,
    ),
  ],
);
