import Link from "next/link";
import { DEFAULT_ICON, DEFAULT_LOGO_DARK, DEFAULT_LOGO_LIGHT, DEFAULT_SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export type SiteLogoProps = {
  siteName?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  showSiteName?: boolean | null;
  href?: string;
  className?: string;
  /** Compact mark for collapsed chrome (sidebar). */
  collapsed?: boolean;
};

export function SiteLogo({
  siteName,
  logoUrl,
  logoDarkUrl,
  showSiteName,
  href = "/",
  className,
  collapsed = false,
}: SiteLogoProps) {
  const name = siteName?.trim() || DEFAULT_SITE_NAME;
  const lightSrc = logoUrl || DEFAULT_LOGO_LIGHT;
  const darkSrc = logoDarkUrl || DEFAULT_LOGO_DARK;

  if (collapsed) {
    return (
      <Link href={href} aria-label={name} className={cn("inline-flex items-center justify-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DEFAULT_ICON} alt="" className="size-8 object-contain" />
      </Link>
    );
  }

  return (
    <Link href={href} aria-label={name} className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lightSrc} alt="" className="h-9 w-auto max-w-[200px] object-contain object-left dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={darkSrc} alt="" className="hidden h-9 w-auto max-w-[200px] object-contain object-left dark:block" />
      </span>
      {showSiteName ? (
        <span className="truncate font-display text-lg font-semibold tracking-tight">{name}</span>
      ) : null}
    </Link>
  );
}
