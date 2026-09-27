"use client";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";

/** The one place global client providers live: theme, query cache, and the single toast system. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Toaster position="bottom-right" richColors closeButton theme="system" />
      </QueryProvider>
    </ThemeProvider>
  );
}
