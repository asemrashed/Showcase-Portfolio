"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlideData } from "@/types/api";

export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [autoplay] = useState(() => Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 }, [autoplay]);
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
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0) return <HeroFallback />;

  return (
    <section className="relative border-b border-border" aria-roledescription="carousel" aria-label="Featured work">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]" aria-hidden={selected !== i}>
              <Container className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
                <div className="max-w-xl">
                  <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.25rem]">{slide.title}</h1>
                  {slide.subtitle && (
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{slide.subtitle}</p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {slide.cta && (
                      <Button asChild size="lg">
                        <Link href={slide.cta.url}>
                          {slide.cta.label}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    )}
                    {slide.project && (
                      <Button asChild size="lg" variant="secondary">
                        <Link href={`/projects/${slide.project.slug}`}>View {slide.project.name}</Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-muted lg:aspect-[5/4]">
                  <Image
                    src={slide.image.url}
                    alt={slide.image.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    priority={i === 0}
                    className="object-cover"
                  />
                </div>
              </Container>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex items-center justify-center gap-4 sm:justify-start sm:pl-8 lg:pl-[calc((100vw-72rem)/2+2rem)]">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={scrollPrev}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground backdrop-blur transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={selected === i}
                  onClick={() => scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    selected === i ? "w-6 bg-primary" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              onClick={scrollNext}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground backdrop-blur transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function HeroFallback() {
  return (
    <section className="border-b border-border">
      <Container className="py-20 lg:py-28">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.25rem]">
            Software we&apos;ve built, shown properly.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            A showcase of projects across web, mobile and SaaS — with the people and process behind each one.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/projects">
                Browse projects
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
