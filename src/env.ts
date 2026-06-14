// env.ts is the file that returns you properly typed environment variables through "env" object.

import { z, ZodError } from "zod";
import dotenv from "dotenv"

dotenv.config({
  path: ".env"
})

// defined schema 
const vars = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(["development","production","test"]).default("development"),
  SARVAM_API: z.string(),
  GROQ_API: z.string(),
  OPENAI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(5).max(256),
})

// parsing the process.env object to check if its in the exact same format and types
const parsed = vars.safeParse(process.env)

// helper function to print prettified errors
const prettyError = (error:ZodError) => z.prettifyError(error)

// parse check 
if (!parsed.success) {
  console.error(prettyError(parsed.error))
  process.exit(1)
}

// exporting ready to use, properly typed env vars.
export const env = parsed.data; 

