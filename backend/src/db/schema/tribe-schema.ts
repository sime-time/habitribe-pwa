import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const tribe = sqliteTable("tribe", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),

  // if leader user is deleted, then set leaderId to null
  leaderId: integer("leader_id").references(() => user.id, { onDelete: "set null" }),

  // unique invite code users will enter to join the tribe
  inviteCode: text("invite_code").notNull().unique(),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull()
});

export const tribeMember = sqliteTable("tribe_member", {
  tribeId: integer("tribe_id").notNull().references(() => tribe.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  // composite key to ensure one instance of a user per tribe
  primaryKey({ columns: [table.tribeId, table.userId] }),
]);
