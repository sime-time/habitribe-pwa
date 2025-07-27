// cron.ts
// This file will export a single function responsible for creating the daily habit entries
import { drizzle } from "drizzle-orm/d1";
import { sql, or } from "drizzle-orm";
import { habit, habitEntry } from "../db/schema";
import { CloudflareBindings } from "../config/bindings";

export async function createDailyHabitEntries(env: CloudflareBindings) {
  console.log("Running daily habit entry creation for all users...");

  const db = drizzle(env.DB);

  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // finds all habits that should have an entry created for today.
  // `.where(...)`: The condition has two parts connected by `OR`:
  //   1. `json_extract(schedule, '$.days') IS NULL`: This selects habits that are "daily" because their
  //      `schedule` JSON does not contain a `days` array.
  //   2. `json_exists(...)`: This checks the habits that *do* have a `days` array. The `json_exists`
  //      function checks if the current `dayOfWeek` number exists within that array. This handles the "weekly" habits.
  const activeHabits = await db
    .select()
    .from(habit)
    .where(
      or(
        sql`json_extract(schedule, '$.days') IS NULL`,
        sql`json_exists(json_extract(schedule, '$.days'), $[?(@ == ${dayOfWeek})])`
      )
    );

  if (activeHabits.length === 0) {
    console.log("No active habits scheduled for today.");
    return;
  }

  // prepare new entries for insertion
  const newEntries = activeHabits.map(h => ({
    habitId: h.id,
    date: todayStr,
    goal: h.goalValue,
    progress: 0,
    status: "pending",
  }));

  // batch insert new entries
  await db.insert(habitEntry)
    .values(newEntries)
    .onConflictDoNothing()
    .run();

}
