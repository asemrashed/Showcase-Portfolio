"use client";
import { useQuery } from "@tanstack/react-query";
import { api, qk, STALE } from "@/lib/api/client";
import { useFilterStore } from "@/stores/filter-store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryChips() {
  const { data: categories, isLoading } = useQuery({
    queryKey: qk.categories,
    queryFn: api.categories,
    staleTime: STALE.categories,
  });
  const { category, setCategory } = useFilterStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }
  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative flex items-center group">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute -left-3 z-10 hidden size-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted group-hover:flex md:-left-4"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1" role="group" aria-label="Filter by category">
        <Chip active={category === ""} onClick={() => setCategory("")}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>
            {c.name}
          </Chip>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute -right-3 z-10 hidden size-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted group-hover:flex md:-right-4"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
