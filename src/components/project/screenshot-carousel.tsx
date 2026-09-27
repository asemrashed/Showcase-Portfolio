"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

export function ScreenshotCarousel({ images, className }: { images: { url: string; alt: string }[]; className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (images.length === 0) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-border" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, i) => (
            <div key={img.url + i} className="relative min-w-0 flex-[0_0_100%] h-full bg-muted">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="90vw"
                className="object-contain object-top"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-1 flex justify-center gap-3 py-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              aria-current={selected === i}
              onClick={() => scrollTo(i)}
              className={cn("h-1.5 rounded-full transition-all", selected === i ? "w-6 bg-primary" : "w-1.5 bg-border")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
