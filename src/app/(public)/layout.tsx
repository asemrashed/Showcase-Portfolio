import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSettings, getContactInfo } from "@/lib/queries/public";
import { load } from "@/lib/data";

export default async function PublicLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  const [settings, contactInfo] = await Promise.all([
    load(() => getSettings(), null),
    load(() => getContactInfo(), null),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Navbar siteName={settings?.siteName ?? "Project Showcase"} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} contactInfo={contactInfo} />
      {modal}
    </div>
  );
}
