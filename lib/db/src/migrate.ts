import { sql } from "drizzle-orm";
import { db } from "./index";

async function getColumnNames(tableName: string): Promise<Set<string>> {
  const result = await db.all<{ name: string }>(sql.raw(`PRAGMA table_info(${tableName})`));
  return new Set(result.map((row) => row.name));
}

async function ensureColumn(
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> {
  const columns = await getColumnNames(tableName);
  if (columns.has(columnName)) {
    return;
  }

  await db.run(sql.raw(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`));
}

export async function ensureTables(): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys = ON`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      email_verified INTEGER,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      last_login_at TEXT,
      post_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.run(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
    ON users(email)
    WHERE email IS NOT NULL
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS accounts (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, provider_account_id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id TEXT NOT NULL,
      author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      author_image_url TEXT,
      content TEXT NOT NULL,
      content_format TEXT NOT NULL DEFAULT 'plain',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL,
      author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      author_image_url TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await ensureColumn(
    "posts",
    "author_user_id",
    "author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL",
  );

  await ensureColumn(
    "posts",
    "content_format",
    "content_format TEXT NOT NULL DEFAULT 'plain'",
  );

  await ensureColumn(
    "comments",
    "author_user_id",
    "author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL",
  );

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )
  `);

  await db.run(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS reactions_post_user_type_unique
    ON reactions(post_id, user_id, type)
  `);
}
