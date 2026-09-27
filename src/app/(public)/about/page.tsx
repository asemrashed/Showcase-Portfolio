import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/state";
import { load } from "@/lib/data";
import { getAbout } from "@/lib/queries/public";
import { paragraphs } from "@/lib/utils";

export const metadata: Metadata = { title: "About", alternates: { canonical: `${siteUrl}/about` } };

export default async function AboutPage() {
  const about = await load(() => getAbout(), null);

  if (!about) {
    return (
      <Section className="pt-14 sm:pt-16">
        <EmptyState title="About page not set up yet" description="Come back soon to learn more about us." showHomeLink />
      </Section>
    );
  }

  return (
    <Section className="pt-14 sm:pt-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        {about.image ? (
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-muted">
            <Image src={about.image.url} alt={about.image.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" priority className="object-cover" />
          </div>
        ) : null}
        <div className={about.image ? "" : "mx-auto max-w-2xl lg:col-span-2"}>
          <h1 className="text-3xl font-semibold sm:text-4xl">{about.title}</h1>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
            {paragraphs(about.description).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {about.stats.length > 0 && (
        <dl className="mt-16 grid grid-cols-2 gap-8 border-y border-border py-10 sm:grid-cols-4">
          {about.stats.map((s) => (
            <div key={s.label}>
              <dt className="text-3xl font-semibold font-display">{s.value}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {about.skills.length > 0 && (
        <div className="mt-16">
          <h2 className="text-sm font-medium text-muted-foreground">Skills &amp; tools</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
