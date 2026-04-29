import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { integer } from "drizzle-orm/sqlite-core";

export const verificationTokensTable = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

export type VerificationToken = typeof verificationTokensTable.$inferSelect;
export type InsertVerificationToken = typeof verificationTokensTable.$inferInsert;
