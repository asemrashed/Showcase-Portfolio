import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <Section className="border-t border-border">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[var(--radius-2xl)] bg-foreground px-8 py-14 text-background sm:px-14 lg:flex-row lg:items-center">
        <div className="max-w-lg">
          <h2 className="text-3xl font-semibold sm:text-4xl">Have a project in mind?</h2>
          <p className="mt-3 text-base leading-relaxed opacity-70">
            Tell us what you&apos;re building. We&apos;ll get back to you within a couple of business days.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 bg-background text-foreground hover:bg-background/90">
          <Link href="/contact">
            Get in touch
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
