// cron.ts
// This file will export a single function responsible for creating the daily habit entries

import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { habit, habitEntry } from "../db/schema";
import { CloudflareBindings } from "../config/bindings";

export async function createDailyHabitEntries(env: CloudflareBindings) {
  console.log("Running daily habit entry creation for all users...");

  const db = drizzle(env.DB);

  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // Find all habits scheduled for today by checking if the current dayOfWeek
  // exists within the habit's "schedule.days" array using a subquery.
  // This is more robust than using json_exists, which has driver-level issues.
  const activeHabits = await db
    .select()
    .from(habit)
    .where(sql`(${dayOfWeek}) in (select value from json_each(${habit.schedule}, '$.days'))`);

  if (activeHabits.length === 0) {
    console.log("No active habits scheduled for today.");
    return;
  }

  // Prepare new entries for insertion
  const newEntries = activeHabits.map((h) => ({
    habitId: h.id,
    date: todayStr,
    goal: h.goalValue,
    progress: 0,
    // status: "pending",
  }));

  // Batch insert new entries
  try {
    await db
      .insert(habitEntry)
      .values(newEntries)
      .run();
  } catch (error) {
    console.error("Error during daily cron job insertion:", error);
    // Re-throw the original error to ensure the cron job fails with a meaningful message
    throw error;
  }

  console.log(`Successfully created ${newEntries.length} new habit entries`);
}
