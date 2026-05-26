import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.RAILWAY_DATABASE_URL;

if (!dbUrl) {
  console.error("Available env vars:", Object.keys(process.env).filter(k => !k.includes("SECRET")).join(", "));
  throw new Error("No database URL found. Set DATABASE_URL in Railway variables.");
}

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });
