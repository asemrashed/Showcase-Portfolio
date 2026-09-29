"use client";
import { useState } from "react";
import { ScreenshotCarousel, type Device, type ScreenshotImage } from "./screenshot-carousel";
import { cn } from "@/lib/utils";

/**
 * Desktop + mobile screenshots, laid out the same way everywhere (project preview and role tabs).
 * lg+: monitor and phone side by side. Smaller screens: one frame at a time behind a Desktop/Mobile switch.
 */
export function DeviceShowcase({
  desktop,
  mobile,
  autoplay = false,
  priority = false,
  className,
}: {
  desktop: ScreenshotImage[];
  mobile: ScreenshotImage[];
  autoplay?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const hasDesktop = desktop.length > 0;
  const hasMobile = mobile.length > 0;
  const [view, setView] = useState<Device>(hasDesktop ? "desktop" : "mobile");

  if (!hasDesktop && !hasMobile) return null;

  const showSwitch = hasDesktop && hasMobile;
  const active: Device = !hasMobile ? "desktop" : !hasDesktop ? "mobile" : view;

  return (
    <div className={className}>
      {showSwitch && (
        <div className="mb-4 flex justify-center lg:hidden">
          <div role="group" aria-label="Preview device" className="inline-flex rounded-full border border-border bg-surface p-1">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={view === d}
                onClick={() => setView(d)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  view === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn(showSwitch && "lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-8")}>
        {hasDesktop && (
          <div className={cn(active === "desktop" ? "block" : "hidden", "lg:block")}>
            <ScreenshotCarousel images={desktop} device="desktop" autoplay={autoplay} priority={priority} />
          </div>
        )}
        {hasMobile && (
          <div className={cn(active === "mobile" ? "block" : "hidden", "lg:block")}>
            <ScreenshotCarousel images={mobile} device="mobile" autoplay={autoplay} priority={priority} />
          </div>
        )}
      </div>
    </div>
  );
}
