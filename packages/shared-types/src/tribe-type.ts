import { z } from "zod";

export const TribeSchema = z.object({
  name: z.string().min(1, "Tribe name required"),
  leaderId: z.coerce.number(),
  inviteCode: z.string().max(6, "Invite code must not be greater than 6 characters").optional(),
  description: z.string().max(300, "Description must not exceed 300 characters").optional(),
});
export type TribeSchemaType = z.infer<typeof TribeSchema>;

export const TribeMemberSchema = z.object({
  tribeId: z.coerce.number(),
  userId: z.coerce.number(),
});
export type TribeMemberSchemaType = z.infer<typeof TribeMemberSchema>;

export const TribeInviteSchema = z.object({
  userId: z.coerce.number(),
  inviteCode: z.string().min(6, "Code must be 6 characters long").max(6, "Code must be 6 characters long"),
});
export type TribeInviteSchemaType = z.infer<typeof TribeInviteSchema>;

export const TribeLeaveSchema = z.object({
  userId: z.coerce.number(),
  tribeId: z.coerce.number(),
});
export type TribeLeaveSchemaType = z.infer<typeof TribeLeaveSchema>;
