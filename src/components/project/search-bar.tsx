"use client";
import { Search, X } from "lucide-react";
import { useFilterStore } from "@/stores/filter-store";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const { search, setSearch } = useFilterStore();

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search projects…"
        aria-label="Search projects"
        className="w-full rounded-[var(--radius-md)] border border-input bg-surface py-2.5 pl-10 pr-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      {search && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setSearch("")}
          className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
