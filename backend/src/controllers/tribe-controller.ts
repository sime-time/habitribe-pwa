import { Context } from "hono";
import { tribe, tribeMember, user, habit, habitEntry } from "../db/schema/index";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, inArray, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { TribeInviteSchema, TribeSchema, TribeLeaveSchema } from "@habitribe/shared-types";
import { generateInviteCode } from "../lib/generate-invite";

export async function createTribe(c: Context) {
  try {
    const body = await c.req.json();
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
  try {
    const { userId } = c.req.param();
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
        leaderName: user.displayName,
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

export async function getTribeMemberData(c: Context) {
  const { tribeId } = c.req.param();
  // const pastDays = c.req.query("pastDays");
  try {
    const db = drizzle(c.env.DB);

    // get all the members of this tribe
    const tribeMembers = await db
      .select({ userId: tribeMember.userId })
      .from(tribeMember)
      .where(eq(tribeMember.tribeId, Number(tribeId)));

    // get the user data for each member
    const tribeUsersPromises = tribeMembers.map(async (member) => {
      const userData = await db
        .select({
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, member.userId))

      // grab all of the user's habits into an array
      const userHabits = await db
        .select()
        .from(habit)
        .where(eq(habit.userId, userData[0].id));

      if (userHabits.length === 0) {
        // if no habits return user data with 0% progress
        return { ...userData[0], progress: 0 };
      }

      const userHabitIds: number[] = userHabits.map((h) => h.id);

      // this will return a single value of all time habit progress consistency
      const progressPercentage = await db
        .select({
          value:
            sql<number>`avg(min(${habitEntry.progress}, ${habitEntry.goal}) * 100.0 / ${habitEntry.goal})`.mapWith(
              Number,
            ),
        })
        .from(habitEntry)
        .where(
          and(
            inArray(habitEntry.habitId, userHabitIds)
          )
        )

      const userProgress = Math.round(progressPercentage[0].value);
      const userWithProgress = { ...userData[0], progress: userProgress }
      return userWithProgress;
    });

    const tribeUsers = await Promise.all(tribeUsersPromises);



    return c.json(tribeUsers, 200);

  } catch (error) {
    console.error("Error getting tribe members", error);
    return c.json({ error: "Something went wrong" }, 500);
  }

}

export async function deleteTribeMember(c: Context) {
  try {
    const body = await c.req.json();
    const { userId, tribeId } = TribeLeaveSchema.parse(body);

    const db = drizzle(c.env.DB);

    // get the tribe leader id
    const tribeData = await db
      .select({
        leaderId: tribe.leaderId,
      })
      .from(tribe)
      .where(eq(tribe.id, tribeId))
      .limit(1);

    const tribeLeaderId = tribeData[0].leaderId;

    // if user is tribe leader, set the tribe leaderId to null
    if (tribeLeaderId === userId) {
      await db
        .update(tribe)
        .set({
          leaderId: null,
        })
        .where(eq(tribe.id, tribeId));
    }

    // delete the tribe member entry for this user
    const deleteTribeMember = await db
      .delete(tribeMember)
      .where(and(
        eq(tribeMember.tribeId, tribeId),
        eq(tribeMember.userId, userId)
      ))
      .returning();

    return c.json({ deleted: deleteTribeMember[0] }, 200);

  } catch (error) {
    console.error("Error deleting tribe member", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}
