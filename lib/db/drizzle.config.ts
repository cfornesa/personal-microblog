import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "..", "data", "microblog.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "turso",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
});
