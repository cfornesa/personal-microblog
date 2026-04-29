import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorImageUrl: text("author_image_url"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export const insertPostSchema = createInsertSchema(postsTable)
  .omit({ id: true, createdAt: true, authorId: true, authorName: true, authorImageUrl: true })
  .extend({
    content: z.string().min(1).max(280),
  });

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
