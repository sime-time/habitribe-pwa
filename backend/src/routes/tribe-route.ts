import { Hono } from "hono";
import { createTribe, getTribe, joinTribe, getTribeMemberData, deleteTribeMember } from "../controllers/tribe-controller";

const router = new Hono();

router.post("/create", createTribe);
router.get("/:userId", getTribe);
router.post("/join", joinTribe);
router.get("/members/:tribeId", getTribeMemberData);
router.delete("/members/delete", deleteTribeMember);

export default router;
