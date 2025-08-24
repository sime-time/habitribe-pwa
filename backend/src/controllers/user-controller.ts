import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { UpdateUserSchema } from "@habitribe/shared-types";

/**
 * A generic controller to update a user's profile information.
 * It uses a Zod schema to ensure type safety and validates the incoming data.
 * It only updates the fields that are provided in the request body.
 */
export async function updateUser(c: Context) {
  try {
    // Get the authenticated user data
    const userBody = await c.req.json();

    // 1. Validate the incoming data against the Zod schema.
    const validUserData = UpdateUserSchema.parse(userBody);

    // If there's no data to update, return a success response.
    if (Object.keys(validUserData).length === 0) {
      return c.json({
        success: true,
        message: "No fields to update.",
      });
    }

    const db = drizzle(c.env.DB);

    // 2. Update the user record in the database with the validated data.
    // Drizzle automatically handles updating only the fields present in the `set` object.
    await db.update(user).set(validUserData).where(eq(user.id, validUserData.id));

    // 3. Fetch the updated user data to return to the client.
    const updatedUser = await db
      .select({
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, validUserData.id))
      .limit(1);

    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
}

export async function getUser(c: Context) {
  try {
    const userId = c.req.param("id");

    const db = drizzle(c.env.DB);

    const userData = await db
      .select({
        id: user.id,
        displayName: user.displayName,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, Number(userId)))
      .limit(1);

    return c.json(userData[0], 200);

  } catch (error) {
    console.error("Error getting user:", error);
    return c.json({ error: "Failed to get user" }, 500);

  }
}
