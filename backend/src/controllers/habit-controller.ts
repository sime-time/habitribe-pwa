import { Context } from "hono";
import { habit, habitEntry } from "../db/schema";
import { and, eq, inArray, sql, like, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HabitSchema, HabitEntrySchema } from "@habitribe/shared-types";
import { ZodError } from "zod";

export async function createHabit(c: Context) {
  const body = await c.req.json();
  try {
    const {
      name,
      userId,
      icon,
      goalValue,
      goalUnit,
      reminderEnabled,
      reminderTime,
      schedule,
    } = HabitSchema.parse(body);

    if (!name || !userId || !goalValue || !goalUnit || !schedule) {
      return c.json({ error: "Missing required field(s)" }, 400);
    }

    const db = drizzle(c.env.DB);
    const newHabit = await db
      .insert(habit)
      .values({
        name,
        userId,
        icon,
        goalValue,
        goalUnit,
        reminderEnabled,
        reminderTime,
        schedule,
      })
      .returning();

    return c.json({ added: newHabit[0] }, 201);
  } catch (error) {
    console.error("Error creating habit", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function deleteHabit(c: Context) {
  const { id } = c.req.param();
  try {
    const db = drizzle(c.env.DB);
    const deletedHabit = await db
      .delete(habit)
      .where(eq(habit.id, parseInt(id)))
      .returning();

    if (deletedHabit.length === 0) {
      return c.json(
        { error: `Habit id:${id} not found. No habit deleted.` },
        404,
      );
    }

    return c.json({ deleted: deletedHabit[0] }, 200);
  } catch (error) {
    console.error("Error deleting habit", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function getUserHabits(c: Context) {
  const { userId } = c.req.param();
  try {
    const db = drizzle(c.env.DB);
    const userHabits = await db
      .select()
      .from(habit)
      .where(eq(habit.userId, parseInt(userId)));

    return c.json(userHabits, 200);
  } catch (error) {
    console.error("Error getting user habits", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}


// ensures that the frontend always receives a complete set of habit entries for any given day,
// creating them on-the-fly if they're missing.
export async function getUserHabitEntries(c: Context) {
  try {
    // get userId from route param
    const { userId } = c.req.param();

    // get date from query param
    let queryDate = c.req.query("date");
    if (!queryDate) {
      // use today's date
      queryDate = new Date().toISOString().slice(0, 10);
    }

    // validate the date format
    const { date } = HabitEntrySchema.pick({ date: true }).parse({
      date: queryDate,
    });

    const targetDate = new Date(date + "T00:00:00Z") // formatted UTC for javascript functions
    const dayOfWeek = targetDate.getUTCDay();

    const db = drizzle(c.env.DB);

    // Get all the user's habits that are active on target date
    const allUserHabits = await db
      .select()
      .from(habit)
      .where(eq(habit.userId, parseInt(userId)));

    const activeHabits = allUserHabits.filter(h => {
      // filter() only keeps the elements for which the callback returns 'true'
      const schedule = h.schedule as { days: number[] };
      if (schedule.days.includes(dayOfWeek)) {
        return true;
      }
      return false;
    });

    if (activeHabits.length === 0) {
      // No active habits for this day, return empty array
      return c.json([], 200);
    }


    // Find which entries already exist for those active habits
    const activeHabitIds = activeHabits.map(h => h.id);
    const existingEntries = await db
      .select()
      .from(habitEntry)
      .where(
        and(
          inArray(habitEntry.habitId, activeHabitIds),
          eq(habitEntry.date, date))
      );

    const existingEntryHabitIds = new Set(existingEntries.map(e => e.habitId));

    // find which entries are missing
    const missingHabits = activeHabits.filter(h => !existingEntryHabitIds.has(h.id));

    // if there are missing entries, batch create them
    if (missingHabits.length > 0) {
      const newEntries = missingHabits.map(h => ({
        habitId: h.id,
        date: date,
        goal: h.goalValue,
        progress: 0,
      }));

      await db.insert(habitEntry).values(newEntries);
    }

    // return the full complete set of habit entries for this date
    // this runs regardless if new entries are created or not
    const output = await db
      .select({
        id: habitEntry.habitId,
        name: habit.name,
        progress: habitEntry.progress,
        goalValue: habitEntry.goal,
        goalUnit: habit.goalUnit,
        status: habitEntry.status,
      })
      .from(habitEntry)
      .leftJoin(habit, eq(habit.id, habitEntry.habitId))
      .where(
        and(
          inArray(habitEntry.habitId, activeHabitIds),
          eq(habitEntry.date, date)
        )
      );

    return c.json(output, 200);

  } catch (error) {
    console.error("Error getting user habit entries", error);
    if (error instanceof ZodError) {
      return c.json({ error: "Invalid date format. Please use YYYY-MM-DD." }, 400);
    }
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function updateHabitEntry(c: Context) {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { date, progress } = HabitEntrySchema.parse(body);

    const db = drizzle(c.env.DB);
    const updatedHabitEntry = await db
      .update(habitEntry)
      .set({
        progress,
        // This logic runs directly in the database for the row being updated.
        // It checks if the new `progress` value is greater than or equal to the
        // existing `goal` value for that row. If it is, it sets the status
        // to 'completed'; otherwise, it sets it to 'pending'.
        status: sql`CASE WHEN ${progress} >= goal THEN 'completed' ELSE 'pending' END`,
      })
      .where(
        and(
          eq(habitEntry.habitId, parseInt(id)),
          eq(habitEntry.date, date)),
      )
      .returning();

    return c.json({ updated: updatedHabitEntry[0] }, 200);
  } catch (error) {
    console.error("Error updating habit entry", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

// calculate the total progress percentage for each day in the requested month
// example json response return:
// {
// "2025-07-01": 85,
// "2025-07-02": 100,
// "2025-07-03": 50,
// "2025-07-04": 0,
// "2025-07-05": 75
// }
export async function getUserProgress(c: Context) {
  try {
    const { userId } = c.req.param();

    const month = c.req.query("month"); // YYYY-MM
    if (!month) {
      return c.json({ error: "Month query parameter is required" }, 400);
    }

    const db = drizzle(c.env.DB);

    const allUserHabits = await db
      .select()
      .from(habit)
      .where(eq(habit.userId, parseInt(userId)));

    if (allUserHabits.length === 0) {
      return c.json({}, 200); // No habits, return empty object
    }

    const userHabitIds: number[] = allUserHabits.map((h) => h.id);

    const dailyProgressPercentage = await db
      .select({
        date: habitEntry.date,
        // NOTE: `habitEntry.goal` is of type integer, so we must cast it to a float/real
        // for division to work correctly.
        dailyAverage:
          sql<number>`avg(min(${habitEntry.progress}, ${habitEntry.goal}) * 100.0 / ${habitEntry.goal})`.mapWith(
            Number,
          ),
      })
      .from(habitEntry)
      .where(
        and(
          inArray(habitEntry.habitId, userHabitIds),
          like(habitEntry.date, `${month}%`),
        ),
      )
      .groupBy(habitEntry.date);

    // use .reduce() to transform array into object
    const totalProgressPerDay = dailyProgressPercentage.reduce(
      (accumulator, entry) => {
        if (entry.date !== null) {
          accumulator[entry.date] = Math.round(entry.dailyAverage);
        }
        return accumulator; // returns object: { entry.date: percentage }
      },
      {} as Record<string, number>,
    );

    return c.json(totalProgressPerDay, 200);
  } catch (error) {
    console.error("getUserProgress Error:", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}
