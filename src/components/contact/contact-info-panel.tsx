import { Mail, Phone, MapPin, Clock, Github, Linkedin, Twitter, Dribbble, Globe } from "lucide-react";
import type { ContactInfoData } from "@/types/api";

const SOCIAL_ICON: Record<string, typeof Globe> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  dribbble: Dribbble,
};

export function ContactInfoPanel({ info }: { info: ContactInfoData | null }) {
  if (!info) return null;
  type Row = { icon: typeof Mail; label: string; href?: string };
  const rows: Row[] = [
    info.email ? { icon: Mail, label: info.email, href: `mailto:${info.email}` } : null,
    info.phone ? { icon: Phone, label: info.phone, href: `tel:${info.phone.replace(/\s+/g, "")}` } : null,
    info.address ? { icon: MapPin, label: info.address, href: info.mapUrl ?? undefined } : null,
    info.workingHours ? { icon: Clock, label: info.workingHours } : null,
  ].filter((r): r is Row => r !== null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary-text">
              <r.icon className="size-4" />
            </span>
            {r.href ? (
              <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="pt-1.5 text-sm text-foreground hover:text-primary-text">
                {r.label}
              </a>
            ) : (
              <span className="pt-1.5 text-sm text-foreground">{r.label}</span>
            )}
          </div>
        ))}
      </div>

      {info.socials.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border pt-6">
          {info.socials.map((s) => {
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
  );
}
