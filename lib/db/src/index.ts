import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "..", "..", "data", "microblog.db");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const client = createClient({ url: `file:${dbPath}` });

export const db = drizzle(client, { schema });

export * from "./schema";
export { eq, desc, asc, and, or, count, sql, like, ne, gt, lt, gte, lte, isNull, isNotNull, inArray, notInArray } from "drizzle-orm";
