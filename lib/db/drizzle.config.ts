import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

const cwd = process.cwd();
const localDbPath = process.env.DATABASE_PATH || path.resolve(cwd, "..", "..", "data", "microblog.db");
const databaseUrl = process.env.DATABASE_URL?.trim() || `file:${localDbPath}`;

if (databaseUrl.startsWith("file:")) {
  const dbPath = databaseUrl.slice("file:".length);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export default defineConfig({
  schema: path.resolve(cwd, "src", "schema", "index.ts"),
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
  },
});
