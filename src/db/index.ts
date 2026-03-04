import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>> & {
  $client: ReturnType<typeof neon>;
};

let _db: DbInstance | null | undefined;

export function getDb(): DbInstance | null {
  if (_db === undefined) {
    if (!process.env.DATABASE_URL) {
      _db = null;
    } else {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql, { schema }) as DbInstance;
    }
  }
  return _db;
}

export type Database = DbInstance;
