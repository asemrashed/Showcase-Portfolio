export type PresignOpts = { key: string; contentType: string; size: number; expiresIn?: number };

/**
 * What the client needs to upload directly to storage (bytes never touch our server).
 *  - S3-compatible: method "PUT" — fetch(uploadUrl, { method: "PUT", headers, body: file }).
 *  - Cloudinary: method "POST" — multipart/form-data POST with `fields` + the file appended
 *    as `file`, to Cloudinary's own upload endpoint.
 * `publicUrl` is computed deterministically up front for both providers (see each provider's
 * comments), so the rest of the app never needs to wait for the upload to finish before knowing
 * an asset's final URL.
 */
export type PresignResult =
  | { provider: "s3"; method: "PUT"; uploadUrl: string; headers: Record<string, string>; key: string; publicUrl: string; expiresIn: number }
  | { provider: "cloudinary"; method: "POST"; uploadUrl: string; fields: Record<string, string>; key: string; publicUrl: string; expiresIn: number };

export interface StorageProvider {
  presignPut(opts: PresignOpts): Promise<PresignResult>;
  publicUrl(key: string): string;
  deleteObject(key: string): Promise<void>;
}
