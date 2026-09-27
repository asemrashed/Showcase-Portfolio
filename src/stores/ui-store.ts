import { create } from "zustand";

type UIState = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  /** A project bottom sheet is mounted (used to pause background autoplay). */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  /** The carousel the visitor is currently interacting with; others pause autoplay. */
  activeCarousel: string | null;
  setActiveCarousel: (id: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  sheetOpen: false,
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
  activeCarousel: null,
  setActiveCarousel: (activeCarousel) => set({ activeCarousel }),
}));
