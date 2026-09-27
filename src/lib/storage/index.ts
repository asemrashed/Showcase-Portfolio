import "server-only";
import { env } from "@/env";
import { s3Provider } from "./s3";
import { cloudinaryProvider } from "./cloudinary";
import type { StorageProvider } from "./types";

/**
 * Defaults to Cloudinary so uploads work immediately. Set FILE_UPLOAD_PROVIDER=s3 once S3_*
 * credentials are in place to switch — no other code needs to change; uploadService.ts,
 * the presign route/action, and the client's useImageUpload hook all go through this provider.
 */
export const storage: StorageProvider = env.FILE_UPLOAD_PROVIDER === "s3" ? s3Provider : cloudinaryProvider;
