import { Hono } from "hono";
import { getAvatarUploadUrl } from "../controllers/upload-controller";

const router = new Hono();

// This route gets the temporary URL for uploading
router.post("/avatar-url", getAvatarUploadUrl);

export default router;
