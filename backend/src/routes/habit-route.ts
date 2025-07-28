import { Hono } from "hono";
import { createHabit, deleteHabit, getUserHabits, getUserHabitEntries, updateHabitEntry } from "../controllers/habit-controller";

const router = new Hono();

router.post("/create", createHabit);
// router.post("/update/:id", updateHabit);
router.delete("/delete/:id", deleteHabit);
router.get("/user/:userId", getUserHabits);
router.get("/entries/user/:userId", getUserHabitEntries);
router.post("/entries/update/:id", updateHabitEntry);

export default router;
