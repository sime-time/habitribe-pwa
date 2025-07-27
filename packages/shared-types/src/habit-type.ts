import { z } from "zod";

export const HabitSchema = z.object({
  name: z.string().min(1, "Habit name required"),
  userId: z.coerce.number(),
  icon: z.string().optional(),
  goalValue: z.coerce.number().min(1),
  goalUnit: z.enum(
    ["minutes", "count"],
    "Goal unit must be in minutes or count",
  ),
  schedule: z.object({
    type: z.string().min(1), // "daily" or "weekly"
    days: z.array(z.number()).optional(),
  }),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().optional(),
});
export type HabitSchemaType = z.infer<typeof HabitSchema>;

export const HabitEntrySchema = z.object({
  // date must be in this format to match the SQLite date string format
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  }),
  progress: z.coerce.number().optional(),
});
export type HabitEntrySchemaType = z.infer<typeof HabitEntrySchema>;
