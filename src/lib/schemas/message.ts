import { z } from "zod";
import { paginationSchema } from "./common";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10).max(5000),
  /** Honeypot: real users leave this empty. Bots fill it. */
  website: z.string().max(200).optional(),
});
export const messageStatusSchema = z.object({ status: z.enum(["NEW", "READ", "ARCHIVED"]) }).strict();
export const messageListQuerySchema = z
  .object({
    status: z.enum(["NEW", "READ", "ARCHIVED"]).optional(),
    search: z.string().trim().max(100).optional(),
  })
  .merge(paginationSchema);

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
