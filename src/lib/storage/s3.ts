import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import type { StorageProvider } from "./types";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required when FILE_UPLOAD_PROVIDER=s3`);
  return value;
}

let client: S3Client | undefined;
function s3() {
  return (client ??= new S3Client({
    region: env.S3_REGION || "auto",
    endpoint: env.S3_ENDPOINT, // unset => real AWS S3; set to an R2/MinIO/etc. endpoint to use those instead
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: required("S3_ACCESS_KEY_ID", env.S3_ACCESS_KEY_ID),
      secretAccessKey: required("S3_SECRET_ACCESS_KEY", env.S3_SECRET_ACCESS_KEY),
    },
    // Newer SDKs add CRC32 checksum params to presigned URLs, which some S3-compatible services
    // (e.g. R2) reject on browser PUTs.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  }));
}

function bucket() {
  return required("S3_BUCKET", env.S3_BUCKET);
}

export const s3Provider: StorageProvider = {
  publicUrl(key) {
    return `${required("S3_PUBLIC_URL", env.S3_PUBLIC_URL).replace(/\/+$/, "")}/${key}`;
  },

  async presignPut({ key, contentType, size, expiresIn = 300 }) {
    const uploadUrl = await getSignedUrl(
      s3(),
      new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType, ContentLength: size }),
      { expiresIn },
    );
    return {
      provider: "s3",
      method: "PUT",
      uploadUrl,
      headers: { "Content-Type": contentType },
      key,
      publicUrl: this.publicUrl(key),
      expiresIn,
    };
  },

  async deleteObject(key) {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  },
};
