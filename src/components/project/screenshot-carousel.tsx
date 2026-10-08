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

/** Screen shape. Height comes from the width, so no calc() is needed. */
const SCREEN_CLASS: Record<Device, string> = {
  desktop: "aspect-[2.1]",   // was aspect-video (16:9)
  mobile: "aspect-[0.457]",
};

/** Outer frame width (screen + bezel). Screen heights stay about equal: 
 *  desktop (W-2)*9/16, phone (W-28)/0.457 */
const FRAME_WIDTH: Record<Device, string> = {
  desktop: "w-full lg:w-[758px] xl:w-[926px]",   // screen ≈ 756×360 / 924×440 at 2.1:1
  mobile: "w-[170px] sm:w-[185px] lg:w-[193px] xl:w-[229px]",
};

const IMAGE_DIMENSIONS: Record<Device, { width: number; height: number; sizes: string }> = {
  desktop: { width: 1440, height: 4000, sizes: "(min-width: 1280px) 926px, (min-width: 1024px) 758px, 100vw" },
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
    <div className={cn("h-full overflow-hidden", device === "mobile" && "bg-white pt-4 no-scrollbar")} ref={emblaRef}>
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
      className={cn("flex min-w-0 max-w-full shrink-0 flex-col", FRAME_WIDTH[device], className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={device === "desktop" ? "Desktop screenshots" : "Mobile screenshots"}
    >
      <Frame screenClassName={SCREEN_CLASS[device]}>{viewport}</Frame>

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
