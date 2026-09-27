"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useFilterStore } from "@/stores/filter-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Two-way sync between ?category=&search= and useFilterStore.
 *  URL -> store: whenever the query string changes (links, back/forward navigation).
 *  store -> URL: debounced, via history.replaceState (no server round-trip, no history spam).
 * Returns the debounced filters that should drive the data query.
 */
export function useFilterUrlSync() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { category, search, hydrate } = useFilterStore();
  const debouncedSearch = useDebouncedValue(search, 350);
  const lastWritten = useRef<string | null>(null);

  // URL -> store
  useEffect(() => {
    const current = params.toString();
    if (current === lastWritten.current) return; // our own write, ignore
    hydrate({ category: params.get("category") ?? "", search: params.get("search") ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // store -> URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (debouncedSearch.trim()) sp.set("search", debouncedSearch.trim());
    const next = sp.toString();
    if (next === params.toString()) return;
    lastWritten.current = next;
    window.history.replaceState(null, "", next ? `${pathname}?${next}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearch, pathname]);

  return { category, search: debouncedSearch.trim() };
}
