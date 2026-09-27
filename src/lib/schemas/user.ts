import { z } from "zod";
import { paginationSchema } from "./common";

export const roleEnum = z.enum(["SUPER_ADMIN", "ADMIN", "DEVELOPER"]);

export const passwordSchema = z
  .string()
  .min(10, "At least 10 characters")
  .max(72, "At most 72 characters")
  .regex(/[A-Za-z]/, "Must contain a letter")
  .regex(/\d/, "Must contain a number");

export const authLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const userCreateSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    name: z.string().trim().min(2).max(80),
    password: passwordSchema,
    role: roleEnum.default("DEVELOPER"),
    active: z.boolean().optional(),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    name: z.string().trim().min(2).max(80),
    password: passwordSchema,
    role: roleEnum,
    active: z.boolean(),
  })
  .partial()
  .strict();

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1).max(72), newPassword: passwordSchema })
  .strict();

export const requestPasswordResetSchema = z
  .object({ email: z.string().trim().toLowerCase().email() })
  .strict();

export const resetPasswordSchema = z
  .object({ token: z.string().trim().min(20).max(500), newPassword: passwordSchema })
  .strict();

export const userListQuerySchema = z
  .object({ search: z.string().trim().max(100).optional(), role: roleEnum.optional() })
  .merge(paginationSchema);

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
