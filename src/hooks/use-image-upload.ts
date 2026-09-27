"use client";
import { useState, useCallback } from "react";
import { presignUploadAction } from "@/actions/upload";
import { unwrap } from "@/lib/api/action-result";
import type { UPLOAD_FOLDERS } from "@/lib/schemas/upload";

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export type UploadedAsset = { url: string; key: string };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const MAX_BYTES = 10 * 1024 * 1024;

export function useImageUpload(folder: UploadFolder) {
  const [progress, setProgress] = useState<"idle" | "presigning" | "uploading" | "error">("idle");

  const upload = useCallback(
    async (file: File): Promise<UploadedAsset> => {
      if (!(ACCEPTED as readonly string[]).includes(file.type)) {
        setProgress("error");
        throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed.");
      }
      if (file.size > MAX_BYTES) {
        setProgress("error");
        throw new Error("Max file size is 10MB.");
      }

      setProgress("presigning");
      const presign = unwrap(
        await presignUploadAction({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          folder,
        }),
      );

      setProgress("uploading");
      let uploadRes: Response;
      if (presign.method === "PUT") {
        uploadRes = await fetch(presign.uploadUrl, { method: "PUT", headers: presign.headers, body: file });
      } else {
        // Cloudinary (and any other POST-based provider): signed fields + the file, as multipart/form-data.
        const form = new FormData();
        for (const [k, v] of Object.entries(presign.fields)) form.append(k, v);
        form.append("file", file);
        uploadRes = await fetch(presign.uploadUrl, { method: "POST", body: form });
      }
      if (!uploadRes.ok) {
        setProgress("error");
        throw new Error("Upload to storage failed. Please try again.");
      }

      setProgress("idle");
      return { url: presign.publicUrl, key: presign.key };
    },
    [folder],
  );

  return { upload, progress, isUploading: progress === "presigning" || progress === "uploading" };
}
