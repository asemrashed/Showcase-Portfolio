import { create } from "zustand";

/**
 * Project list filters (category + search). Kept in sync with the URL by useFilterUrlSync().
 * Server data (the actual project pages) lives in TanStack Query, never here — Rule: server data
 * lives in TanStack Query, never Zustand.
 */
type FilterState = {
  category: string;
  search: string;
  setCategory: (c: string) => void;
  setSearch: (s: string) => void;
  hydrate: (v: { category: string; search: string }) => void;
  reset: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  category: "",
  search: "",
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  hydrate: ({ category, search }) => set({ category, search }),
  reset: () => set({ category: "", search: "" }),
}));
