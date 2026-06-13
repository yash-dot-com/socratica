import {defineConfig} from "drizzle-kit"
import { env } from "./src/env.js"

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migration",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL
  }
})