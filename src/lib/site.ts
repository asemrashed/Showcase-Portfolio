import { env } from "@/env";

export const siteUrl = (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const DEFAULT_SITE_NAME = "ByteNex Solutions";
export const DEFAULT_TAGLINE = "Software we've built, shown properly.";
export const DEFAULT_LOGO_LIGHT = "/logo-light.png";
export const DEFAULT_LOGO_DARK = "/logo-dark.png";
export const DEFAULT_ICON = "/icon.png";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
