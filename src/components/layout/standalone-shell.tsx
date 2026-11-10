import type { ReactNode } from "react";
import { SiteLogo } from "./site-logo";

/** Centered, chrome-free shell — Rules: login/register/not-found/error get no navbar/footer. */
export function StandaloneShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16">
      <div className="mb-10">
        <SiteLogo />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
