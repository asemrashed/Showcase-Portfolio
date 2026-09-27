import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/env";
import type { StorageProvider } from "./types";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required when FILE_UPLOAD_PROVIDER=cloudinary`);
  return value;
}

function cloudName() {
  return required("CLOUDINARY_CLOUD_NAME", env.CLOUDINARY_CLOUD_NAME);
}
function apiKey() {
  return required("CLOUDINARY_API_KEY", env.CLOUDINARY_API_KEY);
}
function apiSecret() {
  return required("CLOUDINARY_API_SECRET", env.CLOUDINARY_API_SECRET);
}

/** Cloudinary's signing algorithm: sha1(sorted "k=v&k=v" params + api_secret), hex digest. */
function sign(params: Record<string, string>) {
  const base = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(base + apiSecret()).digest("hex");
}

/** key always includes its extension (see uploadService's KEY_RE); Cloudinary wants them split. */
function splitKey(key: string) {
  const i = key.lastIndexOf(".");
  return { publicId: i === -1 ? key : key.slice(0, i), format: i === -1 ? undefined : key.slice(i + 1) };
}

export const cloudinaryProvider: StorageProvider = {
  publicUrl(key) {
    return `https://res.cloudinary.com/${cloudName()}/image/upload/${key}`;
  },

  async presignPut({ key, expiresIn = 300 }) {
    const { publicId, format } = splitKey(key);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signParams = { public_id: publicId, timestamp, overwrite: "true", ...(format ? { format } : {}) };
    return {
      provider: "cloudinary",
      method: "POST",
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName()}/image/upload`,
      fields: { ...signParams, api_key: apiKey(), signature: sign(signParams) },
      key,
      publicUrl: this.publicUrl(key),
      expiresIn,
    };
  },

  async deleteObject(key) {
    const { publicId } = splitKey(key);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signParams = { public_id: publicId, timestamp };
    const body = new URLSearchParams({ ...signParams, api_key: apiKey(), signature: sign(signParams) });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName()}/image/destroy`, { method: "POST", body });
    if (!res.ok) throw new Error(`Cloudinary destroy failed: ${res.status} ${await res.text()}`);
  },
};
