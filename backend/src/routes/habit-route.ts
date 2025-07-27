import { Hono } from "hono";
import { createHabit, deleteHabit, getUserHabits, getUserHabitEntries, updateHabitEntry } from "../controllers/habit-controller";

const router = new Hono();

router.post("/create", createHabit);
router.delete("/delete/:id", deleteHabit);
router.get("/user/:userId", getUserHabits);
router.post("/user/:userId/entries", getUserHabitEntries);
router.post("/entry/update/:id", updateHabitEntry);

export default router;
