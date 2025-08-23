import { Hono } from "hono";
import { updateUser, getUser } from "../controllers/user-controller";

const router = new Hono();

router.get("/:id", getUser);
router.put("/update", updateUser);

export default router;
