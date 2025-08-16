import { Hono } from "hono";
import { updateUser } from "../controllers/user-controller";

const router = new Hono();

router.put("/update", updateUser);

export default router;
