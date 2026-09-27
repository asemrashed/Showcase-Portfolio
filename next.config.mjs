/** Hosts next/image may load from: whichever storage provider is active, by env. */
function storagePatterns() {
  const patterns = [
    // Cloudinary (default provider) — delivery is always res.cloudinary.com.
    { protocol: "https", hostname: "res.cloudinary.com" },
    // Common S3-compatible defaults, so switching FILE_UPLOAD_PROVIDER=s3 doesn't also need a
    // next.config.mjs edit for the common cases (real AWS S3, or R2 via S3_ENDPOINT).
    { protocol: "https", hostname: "*.s3.amazonaws.com" },
    { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
    { protocol: "https", hostname: "**.r2.dev" },
    { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
  ];
  try {
    const u = new URL(process.env.S3_PUBLIC_URL ?? "");
    patterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    });
  } catch {
    /* S3_PUBLIC_URL unset at build — defaults above still apply */
  }
  return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: storagePatterns(),
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Category detail pages live on the filtered project list (canonical).
      { source: "/categories/:slug", destination: "/projects?category=:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
