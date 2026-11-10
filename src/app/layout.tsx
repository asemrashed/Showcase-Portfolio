import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DEFAULT_SITE_NAME, DEFAULT_TAGLINE, siteUrl } from "@/lib/site";
import { load } from "@/lib/data";
import { getSettings } from "@/lib/queries/public";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await load(() => getSettings(), null);
  const name = settings?.siteName || DEFAULT_SITE_NAME;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: name, template: `%s · ${name}` },
    description: settings?.tagline || DEFAULT_TAGLINE,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/icon.png" }],
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
