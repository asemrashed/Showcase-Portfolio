import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Section, SectionHeading } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfoPanel } from "@/components/contact/contact-info-panel";
import { load } from "@/lib/data";
import { getContactInfo } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building — we'll get back to you soon.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default async function ContactPage() {
  const info = await load(() => getContactInfo(), null);

  return (
    <Section className="pt-14 sm:pt-16">
      <SectionHeading eyebrow="Get in touch" title="Contact us" description="Tell us what you're building. We'll reply within a couple of business days." />
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />
        <ContactInfoPanel info={info} />
      </div>
    </Section>
  );
}
