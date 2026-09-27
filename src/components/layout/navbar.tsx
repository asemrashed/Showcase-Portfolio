"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowUpRight } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NAV_LINKS, isActivePath } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";

export function Navbar({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {siteName}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-[var(--radius-md)] px-3.5 py-2 text-sm font-medium transition-colors",
                isActivePath(pathname, link.href)
                  ? "text-primary-text"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className="ml-1 hidden items-center gap-1 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover md:inline-flex"
          >
            Start a project
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-foreground hover:bg-muted md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}
