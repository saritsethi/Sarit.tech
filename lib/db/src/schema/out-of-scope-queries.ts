import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const outOfScopeQueries = pgTable("out_of_scope_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  conversationId: text("conversation_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OutOfScopeQuery = typeof outOfScopeQueries.$inferSelect;
