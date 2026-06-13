### kickoff
<br>

A minimal opinionated production-ready TS + Express + PostgreSQL + Drizzle starter template for building backends quickly.

<br>
<img width="1154" height="516" alt="image" src="https://github.com/user-attachments/assets/166e3d55-c3c4-422d-b028-49445e14d310" />

<br>
<br>

**Built with:**
- Express 5
- Zod
- PostgreSQL (pg)
- Drizzle ORM
- TypeScript

<br>

### Future Scopes 
- enhanced backend security
- betterAuth integration for authentication workflows
- end to end testing  

<br>

### Features

**Preconfigured:**
- `/health` check route
- Request logger
- Rate Limiter 
- TypeScript
- `dev`, `build`, `start` npm scripts
- Drizzle client
- Express app
- Generic Zod validator middleware
- Standardized `successResponse` and `errorResponse` helper functions

<br>

**Module based file organization:**
- Everything related to a feature lives inside a single folder
- `post.schema.ts`
- `post.routes.ts`
- `post.controller.ts`
- `post.service.ts`
- `post.query.ts`

<br>

### File Organization

Simple file organization with no overhead of understanding complex 20-file templates with scattered code.

```
src/
  index.ts       ← starts server (listen, port)
  app.ts         ← creates and configures express app, simply import in index.ts and run
  modules/       ← all code related to entities lives here
  lib/           ← all shared code, helper and utility functions live here
  middlewares/   ← all middlewares live here
```

<br>

### Deployment

- **Database:** Railway (PostgreSQL)
- **Backend:** Railway

**npm scripts — LOCAL ONLY (read the note below):**

```bash
npm run dev    # tsx watch --env-file .env src/index.ts
npm run build  # tsc
npm run start  # node --env-file .env dist/index.js
```

- **NOTE:** Remove `--env-file .env` from the `start` script before deploying. It is only for local development. Railway handles environment variables through its dashboard.

<br>

### Module Based File Organization

Each module is self-contained and handles only one specified responsibility.

**Flow is always:** `route → controller → service → DB`

<br>

Easy and predictable.

```
modules/
  links/
    links.routes.ts      ← defines the routes
    links.controller.ts  ← handles req/res, calls service
    links.schema.ts      ← zod schemas for this feature (not to be confused with drizzle schemas)
    links.service.ts     ← business logic, talks to DB
    links.query.ts       ← raw drizzle queries, repository functions
```

<br>

### Getting DATABASE_URL from Railway

<br>

There are 2 types of database URLs that Railway provides:

- **Public URL** — can be used to access the DB from anywhere, uses TCP proxy
  ```
  postgresql://postgres:password@region.railway.app:port/railway
  ```
- **Private URL** — only accessible from services within the same Railway project via internal networking, uses `railway.internal` hostname

- **Environment variable:**
  ```
  DATABASE_URL=postgresql://postgres:password@region.railway.app:port/railway
  ```

- When deploying to Railway, configure the `DATABASE_URL` environment variable separately in the Railway dashboard.
- [PostgreSQL + Drizzle docs](https://orm.drizzle.team/docs/tutorials/node-railway-pg)

<br>

### Zod Guide

Zod workflow is simple:

1. Define schema
2. Create types from schema
3. Create object with type
4. Call `schemaName.parse(object)` or `schemaName.safeParse(object)`

<br>

**On success:**
- `parse()` returns the same object passed into it
- `safeParse()` returns `{ success: true, data: { ...object } }`

**On failure:**
- `parse()` throws a `ZodError`
- `safeParse()` returns `{ success: false, error: ZodError }`

<br>

### Drizzle Setup Guide
<br>

**npm scripts:**
```bash
npm run drizzle:generate  # npx drizzle-kit generate
npm run drizzle:migrate   # npx drizzle-kit migrate
npm run drizzle:push      # npx drizzle-kit push
```

**`drizzle.config.ts`** — all Drizzle related config goes here.

- **NOTE:** `drizzle.config.ts` must exist in the root of the project.

This file tells Drizzle:
- Where your schema files are defined
- What dialect your database is (postgresql, mysql, sqlite, etc.)
- Your database connection string

**Organization pattern:**
```
src/
  db/
    db.ts        ← stores the drizzle client
    schema/      ← stores all schema files for each individual table
      links.ts
      posts.ts
      users.ts
```

<br>

**Example `drizzle.config.ts`:**
```js
import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migration",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL
  }
})
```

<br>

### Drizzle ORM Guide *(coming soon)*

- Writing queries with Drizzle ORM
- Insert
- Delete
- Update
- Others

<br>

## Drizzle Kit Guide

Drizzle Kit is a helper that manages database schema migrations.

| Command | Description |
|---|---|
| `npx drizzle-kit generate` | Generates SQL migration files from your schema changes |
| `npx drizzle-kit migrate` | Applies the generated migrations against your DB |
| `npx drizzle-kit push` | Skips migration files, pushes schema directly to DB |
| `npx drizzle-kit studio` | Opens a UI to browse your DB in the browser |

<br>

**Tips:**
- Use `generate` + `migrate` for production
- Use `push` for development
- Use `studio` for debugging

<br>

### Express Guide

Express is a web framework built on the Node.js runtime. The latest alternative is Hono.js, which is faster and properly typed with TypeScript. Learning Express makes you capable enough to use any JS web framework — they're all the same concepts.

- Middlewares guide (still writing, cause I don't use AI)
- Route order guide 

<br>

### Progress

- [x] First commit — installed packages, setup folder structure, configured Drizzle, configured npm scripts, configured typed environment variables, structured db folder
- [x] Second commit — add Zod validator middleware, error handling middleware, standard response and request helper, request logger, add cookie-parser, implement express-rate-limiter
- [x] Third commit — restructure `index.ts` and `app.ts`, setup example routes, deploy to Railway
