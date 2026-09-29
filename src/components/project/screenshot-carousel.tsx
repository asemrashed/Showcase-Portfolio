"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonitorFrame } from "./monitor-frame";
import { PhoneFrame } from "./phone-frame";
import { cn } from "@/lib/utils";

export type ScreenshotImage = { url: string; alt: string };
export type Device = "desktop" | "mobile";

/** Same screen height for both frames so desktop + mobile line up side by side. */
const SCREEN_HEIGHT = "h-[420px] sm:h-[480px] lg:h-[560px]";

const IMAGE_DIMENSIONS: Record<Device, { width: number; height: number; sizes: string }> = {
  desktop: { width: 1440, height: 4000, sizes: "(min-width: 1024px) 800px, 100vw" },
  mobile: { width: 390, height: 4200, sizes: "280px" },
};

/**
 * Device frame + carousel. Every slide loads scrolled to the top of the screenshot and scrolls
 * vertically inside the frame, so a full-page capture can be read top to bottom.
 * With 2+ images it loops infinitely, auto-advances (pauses on hover/touch) and has manual controls.
 */
export function ScreenshotCarousel({
  images,
  device,
  autoplay = false,
  priority = false,
  className,
}: {
  images: ScreenshotImage[];
  device: Device;
  autoplay?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const multiple = images.length > 1;
  const [autoplayPlugin] = useState(() => Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: multiple }, multiple && autoplay ? [autoplayPlugin] : []);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (images.length === 0) return null;

  const dims = IMAGE_DIMENSIONS[device];
  const Frame = device === "desktop" ? MonitorFrame : PhoneFrame;

  const viewport = (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {images.map((img, i) => (
          <div
            key={img.url + i}
            className="thin-scroll h-full min-w-0 flex-[0_0_100%] overflow-y-auto overflow-x-hidden"
            aria-hidden={multiple ? selected !== i : undefined}
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={dims.width}
              height={dims.height}
              sizes={dims.sizes}
              quality={85}
              priority={priority && i === 0}
              className="block h-auto w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cn("flex min-w-0 flex-col", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={device === "desktop" ? "Desktop screenshots" : "Mobile screenshots"}
    >
      <Frame screenClassName={SCREEN_HEIGHT}>{viewport}</Frame>

      {multiple && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous screenshot"
            onClick={scrollPrev}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                aria-label={`Show screenshot ${i + 1}`}
                aria-current={selected === i}
                onClick={() => scrollTo(i)}
                className={cn(
                  "h-1.5 cursor-pointer rounded-full transition-all",
                  selected === i ? "w-6 bg-primary" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next screenshot"
            onClick={scrollNext}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
