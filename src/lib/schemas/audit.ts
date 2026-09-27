import { z } from "zod";
import { idSchema, paginationSchema } from "./common";

export const auditQuerySchema = z
  .object({
    entity: z.string().max(60).optional(),
    action: z.string().max(80).optional(),
    actorId: idSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .merge(paginationSchema.extend({ pageSize: z.coerce.number().int().min(1).max(100).default(30) }));
export type AuditQuery = z.infer<typeof auditQuerySchema>;
