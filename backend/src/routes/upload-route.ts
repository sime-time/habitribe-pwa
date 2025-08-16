import { Hono } from "hono";
import {
  getAvatarUploadUrl,
  updateUserAvatar,
} from "../controllers/upload-controller";

const router = new Hono();

// This route gets the temporary URL for uploading
router.post("/avatar/url", getAvatarUploadUrl);

// This route updates the user's record with the new avatar key after the upload is complete
router.put("/avatar/update", updateUserAvatar);

export default router;
