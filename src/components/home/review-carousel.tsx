"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { initials, cn } from "@/lib/utils";
import type { ReviewData } from "@/types/api";

export function ReviewCarousel({ reviews }: { reviews: ReviewData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", dragFree: reviews.length > 2 });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (reviews.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-5 flex">
          {reviews.map((r) => (
            <div key={r.id} className="min-w-0 flex-[0_0_88%] pl-5 sm:flex-[0_0_46%] lg:flex-[0_0_32%]">
              <figure className="flex h-full flex-col justify-between rounded-[var(--radius-xl)] border border-border bg-surface p-6">
                <div>
                  <div className="mb-4 flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn("size-3.5", i < r.rating ? "fill-primary text-primary" : "fill-none text-border")}
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-foreground">&ldquo;{r.content}&rdquo;</blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-medium text-primary-text">
                    {r.avatarUrl ? (
                      <Image src={r.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      initials(r.authorName)
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.authorName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[r.authorRole, r.company].filter(Boolean).join(", ")}
                      {r.project && (
                        <>
                          {(r.authorRole || r.company) && " · "}
                          <Link href={`/projects/${r.project.slug}`} className="hover:text-primary-text">
                            {r.project.name}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
      {reviews.length > 1 && (
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous reviews"
            disabled={!canPrev}
            onClick={scrollPrev}
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next reviews"
            disabled={!canNext}
            onClick={scrollNext}
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
