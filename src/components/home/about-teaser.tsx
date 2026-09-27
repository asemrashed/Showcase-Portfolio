import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { paragraphs } from "@/lib/utils";
import type { AboutData } from "@/types/api";

export function AboutTeaser({ about }: { about: AboutData }) {
  const intro = paragraphs(about.description)[0] ?? about.description;

  return (
    <Section className="border-t border-border">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {about.image ? (
          <div className="relative order-1 aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-muted lg:order-none">
            <Image src={about.image.url} alt={about.image.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
          </div>
        ) : null}
        <div className={about.image ? "" : "mx-auto max-w-2xl text-center lg:col-span-2"}>
          <p className="mb-3 text-sm font-medium text-primary-text">About us</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">{about.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>

          {about.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-6">
              {about.stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-semibold font-display">{s.value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}

          <Button asChild variant="secondary" className="mt-8">
            <Link href="/about">
              More about us
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
