import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userSetupTable = sqliteTable("user_setup", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  motivation: text().notNull(),
  goal: int().notNull(),
  payday_schedule: text().notNull(), // Store as ISO date string
  current_step: int().notNull().default(1), // Track which question they're on
  completed: int().notNull().default(0), // Boolean flag for wizard completion
  created_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // When they started
  updated_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // Last answer
});
