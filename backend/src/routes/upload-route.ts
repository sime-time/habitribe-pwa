import { Hono } from "hono";
import { uploadAvatar } from "../controllers/upload-controller";

const router = new Hono();

router.post("/avatar-url", uploadAvatar);

export default router;
