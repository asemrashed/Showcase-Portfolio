import { z } from "zod";

export const ALLOWED_MIME = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
} as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const UPLOAD_FOLDERS = [
  "projects",
  "roles",
  "categories",
  "hero",
  "about",
  "reviews",
  "avatars",
  "og",
  "settings",
] as const;

export const presignSchema = z
  .object({
    filename: z.string().trim().min(1).max(200),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
    size: z.number().int().min(1).max(MAX_UPLOAD_BYTES, "Max file size is 10MB"),
    folder: z.enum(UPLOAD_FOLDERS),
  })
  .superRefine((v, ctx) => {
    const ext = v.filename.split(".").pop()?.toLowerCase() ?? "";
    if (!(ALLOWED_MIME[v.contentType] as readonly string[]).includes(ext)) {
      ctx.addIssue({ code: "custom", path: ["filename"], message: "File extension does not match the content type" });
    }
  });
export type PresignInput = z.infer<typeof presignSchema>;
