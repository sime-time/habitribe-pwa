import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const habit = sqliteTable("habit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  icon: text("icon"),
  name: text("name").notNull(),
  description: text("description"),

  // Goal tracking
  goalValue: integer("goal_value").notNull(),
  goalUnit: text("goal_unit").notNull(),

  // Flexible scheduling
  // e.g. { "type": "daily" , "days": [0,1,2,3,4,5,6] }
  // or { "type": "weekly", "days": [1,3,5] }
  schedule: text("schedule", { mode: "json" }).notNull(),

  // Reminder settings
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" }).default(false).notNull(),
  reminderTime: text("reminder_time"), // e.g. "09:00"

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const habitEntry = sqliteTable("habit_entry", {
  // use composite primary key (habitId & date)
  habitId: integer("habit_id").notNull().references(() => habit.id, { onDelete: "cascade" }),
  date: text("date").default(sql`(CURRENT_DATE)`),
  // the habit goal value might change, so keep whatever the goal was at that time
  goal: integer("goal").notNull(),
  progress: integer("progress").default(0).notNull(),
}, (table) => [
  // composite key to ensure one unique habit entry per day
  primaryKey({ columns: [table.habitId, table.date] }),
]);
