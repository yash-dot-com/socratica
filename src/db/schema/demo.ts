// simple demo table as scaffolding 
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const demoTableSchema = pgTable("demo", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull()
})

