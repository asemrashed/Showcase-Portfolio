"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function ProjectSheet({ children, title }: { children: ReactNode; title: string }) {
  const router = useRouter();
  const setSheetOpen = useUIStore((s) => s.setSheetOpen);

  useEffect(() => {
    setSheetOpen(true);
    return () => setSheetOpen(false);
  }, [setSheetOpen]);

  const close = () => router.back();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          <Dialog.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild forceMount aria-describedby={undefined}>
            <motion.div
              role="document"
              className="thin-scroll fixed inset-x-0 bottom-0 z-50 top-[8dvh] overflow-y-auto rounded-t-[var(--radius-2xl)] border-t border-border bg-background shadow-2xl focus:outline-none sm:top-[10dvh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <Dialog.Title className="sr-only">{title}</Dialog.Title>
              <div className="sticky top-0 z-10 flex justify-center border-b border-border bg-background/95 py-2.5 backdrop-blur sm:py-2">
                <span className="h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
                <Dialog.Close
                  aria-label="Close"
                  className="absolute right-3 top-2 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              {children}
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
