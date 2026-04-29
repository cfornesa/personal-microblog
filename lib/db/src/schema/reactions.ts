import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { postsTable } from "./posts";
import { usersTable } from "./users";

export const reactionTypes = ["like"] as const;

export const reactionsTable = sqliteTable(
  "reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (table) => ({
    reactionUniq: uniqueIndex("reactions_post_user_type_unique").on(
      table.postId,
      table.userId,
      table.type,
    ),
  }),
);

export type Reaction = typeof reactionsTable.$inferSelect;
export type InsertReaction = typeof reactionsTable.$inferInsert;
