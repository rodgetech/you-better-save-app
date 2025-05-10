import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userSetupTable = sqliteTable("user_setup", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  motivation: text().notNull(),
  goal: int().notNull(),
  current_step: int().notNull().default(1), // Track which question they're on
  completed: int().notNull().default(0), // Boolean flag for wizard completion
  created_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // When they started
  updated_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // Last answer
});

export const transactionsTable = sqliteTable("transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  amount: int().notNull(),
  date: text().notNull(),
  created_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // When they started
  updated_at: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`), // Last answer
});

export type UserSetup = typeof userSetupTable.$inferSelect;
export type UserSetupInsert = typeof userSetupTable.$inferInsert;

export type Transactions = typeof transactionsTable.$inferSelect;
