import { DrizzleD1Database } from "drizzle-orm/d1";
import { tribe } from "../db/schema/index";
import { eq } from "drizzle-orm";

export async function generateInviteCode(db: DrizzleD1Database) {
  // avoid amibiguous characters
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codeLength = 6;

  let code: string;
  let isUnique = false;

  // loop until a unique code is generated
  do {
    const randomBytes = new Uint8Array(codeLength);
    crypto.getRandomValues(randomBytes);

    code = Array
      .from(randomBytes)
      .map((byte) => chars[byte % chars.length])
      .join("");

    // check if the code already exists in the database
    const existingTribe = await db
      .select({ id: tribe.id })
      .from(tribe)
      .where(eq(tribe.inviteCode, code))
      .limit(1);

    if (existingTribe.length === 0) {
      isUnique = true;
    }
  } while (!isUnique);

  return code;
}
