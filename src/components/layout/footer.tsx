import Link from "next/link";
import { Github, Linkedin, Twitter, Dribbble, Globe } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NAV_LINKS } from "@/lib/site";
import type { SettingsData, ContactInfoData } from "@/types/api";

const SOCIAL_ICON: Record<string, typeof Globe> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  dribbble: Dribbble,
};

export function Footer({ settings, contactInfo }: { settings: SettingsData | null; contactInfo: ContactInfoData | null }) {
  const year = new Date().getFullYear();
  const siteName = settings?.siteName ?? "Project Showcase";
  const socials = settings?.socials?.length ? settings.socials : contactInfo?.socials ?? [];

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-10 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <span className="font-display text-lg font-semibold">{siteName}</span>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {settings?.footerText ?? settings?.tagline ?? "Software we've built, shown properly."}
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => {
                const Icon = SOCIAL_ICON[s.platform.toLowerCase()] ?? Globe;
                return (
                  <a
                    key={s.platform + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-text"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:flex sm:gap-16">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-muted-foreground">Navigate</span>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-foreground transition-colors hover:text-primary-text">
                {l.label}
              </Link>
            ))}
          </div>
          {(contactInfo?.email || contactInfo?.phone) && (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-medium text-muted-foreground">Contact</span>
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} className="text-sm text-foreground transition-colors hover:text-primary-text">
                  {contactInfo.email}
                </a>
              )}
              {contactInfo?.phone && <span className="text-sm text-foreground">{contactInfo.phone}</span>}
            </div>
          )}
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {year} {siteName}. All rights reserved.</span>
      </Container>
    </footer>
  );
}
