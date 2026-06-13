import { json, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql/sql";

export const user = pgTable("user", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull().unique(),
    password: varchar("password").notNull(),
    grade: varchar("grade").notNull(),
    preferredLanguage: varchar("preferred_language").notNull(),
    favorites: text("favorites").array().notNull().default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

export const session = pgTable("session", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: serial("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    topic: varchar("topic").notNull(),
    roadmap: json("roadmap").notNull(),
    transcript: json("transcript").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

