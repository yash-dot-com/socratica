import { db } from "../db/db.js"
import { sql } from "drizzle-orm"

const dropDatabase = async () => {
    await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE`)
    console.log("resetted database successfully!")
}

dropDatabase()
