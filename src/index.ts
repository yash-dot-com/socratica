// entry point for application 
// env contains typed environment variables.

import { env } from "./env.js";
import app from "./app.js";
import { connectDB } from "./db/db.js";

// connect to database first
// because we don't want users to interact with server without connecting our database first
await connectDB()

// then start server
app.listen(env.PORT, () => {
  console.log(`server running on PORT ${env.PORT}`)
})
