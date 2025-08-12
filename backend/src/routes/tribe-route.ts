import { Hono } from "hono";
import { createTribe, getTribe, joinTribe } from "../controllers/tribe-controller";

const router = new Hono();

router.post("/create", createTribe);
router.get("/:userId", getTribe);
router.post("/join", joinTribe);

export default router;
