import { z } from "zod";

// Defines the shape of the data for updating a user's profile.
// All fields are optional, allowing the frontend to send only the data that has changed.
export const UpdateUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name cannot be empty").optional(),
  displayName: z
    .string()
    .min(3, "Display name must be at least 3 characters")
    .optional(),
  email: z.email("Invalid email address").optional(),
  image: z.string().optional(), // This will be the key from the R2 upload
});

export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
