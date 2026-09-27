import Link from "next/link";
import type { ReactNode } from "react";

/** Centered, chrome-free shell — Rules: login/register/not-found/error get no navbar/footer. */
export function StandaloneShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16">
      <Link href="/" className="mb-10 font-display text-lg font-semibold tracking-tight">
        Project Showcase
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
