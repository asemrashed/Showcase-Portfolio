import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryData } from "@/types/api";

export function CategoryCard({ category }: { category: CategoryData }) {
  return (
    <Link
      href={`/projects?category=${category.slug}`}
      className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {category.image ? (
        <Image
          src={category.image.url}
          alt={category.image.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary-soft to-muted" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative flex items-end justify-between gap-3 p-5">
        <div>
          <h3 className="text-lg font-medium text-white">{category.name}</h3>
          <p className="mt-1 text-sm text-white/75">
            {category.projectCount} {category.projectCount === 1 ? "project" : "projects"}
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-white/25">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function CategoryGrid({ categories, columns = 3 }: { categories: CategoryData[]; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
