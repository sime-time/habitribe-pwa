import { Context } from "hono";
import { tribe, tribeMember, user } from "../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { TribeInviteSchema, TribeSchema } from "@habitribe/shared-types";
import { generateInviteCode } from "../lib/generate-invite";

export async function createTribe(c: Context) {
  const body = await c.req.json();
  try {
    const { name, leaderId, description } = TribeSchema.parse(body);

    const db = drizzle(c.env.DB);

    // generate a unique tribe invite code
    const inviteCode = await generateInviteCode(db);

    // insert a new tribe
    const newTribe = await db
      .insert(tribe)
      .values({
        name,
        leaderId,
        description,
        inviteCode,
      })
      .returning();

    // insert the first member of the tribe (leader)
    await db
      .insert(tribeMember)
      .values({
        tribeId: newTribe[0].id,
        userId: leaderId,
      })
      .returning();

    // send back the invite code
    return c.json({ code: newTribe[0].inviteCode }, 201);

  } catch (error) {
    console.error("Error creating tribe", error);
    if (error instanceof ZodError) {
      return c.json({ error: error.issues[0].message });
    }
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function getTribe(c: Context) {
  const { userId } = c.req.param();
  try {
    const db = drizzle(c.env.DB);

    // Get the tribeId from the tribeMember table
    const member = await db
      .select({ tribeId: tribeMember.tribeId })
      .from(tribeMember)
      .where(eq(tribeMember.userId, parseInt(userId)));

    if (member.length === 0) {
      return c.json({ message: "User not found in any tribe" }, 404);
    }

    const tribeId = member[0].tribeId;

    // Get the tribe and join with the user table to get the leader's info
    const tribeData = await db
      .select({
        id: tribe.id,
        name: tribe.name,
        description: tribe.description,
        inviteCode: tribe.inviteCode,
        leaderId: tribe.leaderId,
        leaderName: user.name,
        leaderImage: user.image,
      })
      .from(tribe)
      .leftJoin(user, eq(tribe.leaderId, user.id))
      .where(eq(tribe.id, tribeId));

    if (tribeData.length === 0) {
      return c.json({ message: "Tribe not found" }, 404);
    }

    return c.json(tribeData[0], 200);
  } catch (error) {
    console.error("Error getting tribe", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function joinTribe(c: Context) {
  const body = await c.req.json();
  try {
    const { userId, inviteCode } = TribeInviteSchema.parse(body);

    const db = drizzle(c.env.DB);

    // determine if the invite code belongs to any tribe
    const invitedTribe = await db
      .select()
      .from(tribe)
      .where(eq(tribe.inviteCode, inviteCode));

    if (invitedTribe.length === 0) {
      throw new Error("Invite code does not belong to any tribe");
    }

    // if invite code is valid,
    // the user becomes a member of that tribe
    await db
      .insert(tribeMember)
      .values({
        tribeId: invitedTribe[0].id,
        userId: userId,
      })
      .returning();

    return c.json(invitedTribe[0], 200);

  } catch (error) {
    console.error("Error joining tribe", error);
    return c.json({ error: "Invalid Invite Code" }, 500);
  }
}
