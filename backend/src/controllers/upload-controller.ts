import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { user } from "../db/schema/index";
import { eq } from "drizzle-orm";

/**
 * Think of this function like giving a valet a special, one-time key to park a car.
 */
export async function getAvatarUploadUrl(c: Context) {
  try {
    // 1. The Valet (Frontend) Asks for the Key
    // The frontend tells us what kind of file it has ('contentType')
    // and we verify who the user is from their authentication token ('sub').
    const { contentType, userId } = await c.req.json();

    // 2. You (Backend) Prepare the Special Key

    // First, we securely connect to our garage (Cloudflare R2 bucket)
    // using the secret credentials stored in our environment variables.
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${c.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: c.env.R2_ACCESS_KEY_ID,
        secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      },
    });

    // Next, we choose a unique parking spot (the 'key') for the file.
    // This prevents mix-ups and keeps the files organized by user.
    // The final path will look like: "avatars/user_id/a_random_uuid"
    const key = `avatars/${userId}/${crypto.randomUUID()}`;

    // Then, we create a very specific instruction for the valet (the command).
    // It says: "You are only allowed to UPLOAD ('PutObjectCommand') a file..."
    const command = new PutObjectCommand({
      Bucket: c.env.BUCKET.bucketName, // "...to this specific garage ('Bucket')..."
      Key: key,                        // "...at this exact parking spot ('Key')..."
      ContentType: contentType,        // "...and the file must be of this type ('ContentType')."
    });

    // 3. Generate the One-Time Valet Key (the Pre-signed URL)
    // We use our secret credentials and the specific instruction to generate a special,
    // temporary, and secure URL. This URL is the one-time key.
    // It expires in 1 hour ('expiresIn: 3600').
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    // 4. Give the Key to the Valet (Frontend)
    // We send the temporary URL ('uploadUrl') and the parking spot name ('key')
    // back to the frontend so it can complete the upload and tell us where the file is.
    return c.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return c.json({ error: "Failed to generate upload URL" }, 500);
  }
}

/**
 * After the frontend successfully uploads the file to R2, it calls this function.
 * This function takes the 'key' (the unique path/filename) of the uploaded image
 * and saves it to the user's record in the database.
 */
export async function updateUserAvatar(c: Context) {
  try {
    // Get the image key and user's id from the request body
    const { key, userId } = await c.req.json();

    if (!key) {
      return c.json({ error: "Image key is required" }, 400);
    }

    const db = drizzle(c.env.DB);

    // Find the user in the database using their ID and update their
    // 'image' field with the key of the newly uploaded file.
    await db
      .update(user)
      .set({ image: key })
      .where(eq(user.id, Number(userId)));

    return c.json({ success: true, message: "Avatar updated successfully" }, 201);
  } catch (error) {
    console.error("Error updating user avatar:", error);
    return c.json({ error: "Failed to update avatar" }, 500);
  }
}
