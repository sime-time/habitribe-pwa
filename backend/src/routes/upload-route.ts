import { Hono } from "hono";
import { getProofUploadUrl, getAvatarUploadUrl } from "../controllers/upload-controller";

const router = new Hono();

// This route gets the temporary URL for uploading
router.post("/avatar-url", getAvatarUploadUrl);
router.post("/proof-url", getProofUploadUrl);

export default router;
