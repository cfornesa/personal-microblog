import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const postContentFormatSchema = z.enum(["plain", "html"]);

export const postsTable = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: text("author_id").notNull(),
  authorUserId: text("author_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  authorImageUrl: text("author_image_url"),
  content: text("content").notNull(),
  contentFormat: text("content_format").notNull().default("plain"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export const insertPostSchema = createInsertSchema(postsTable)
  .omit({
    id: true,
    createdAt: true,
    authorId: true,
    authorUserId: true,
    authorName: true,
    authorImageUrl: true,
  })
  .extend({
    content: z.string().min(1).max(40000),
    contentFormat: postContentFormatSchema.default("html"),
  });

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
