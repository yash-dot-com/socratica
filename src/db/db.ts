// drizzle client is here.
// NOTE : railway database url are of 2 types, read more in README.md

import { sql } from "drizzle-orm";
import { env } from "../env.js";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(env.DATABASE_URL)

export async function connectDB() {
  try {
    await db.execute(sql`SELECT 1`)
    console.log("DATABASE CONNECTED")
  } catch (err) {
    console.error(`DATABASE CONNECTION FAILED`, err)
    process.exit(1)
  }
}