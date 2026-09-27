import type { Metadata } from "next";
import { CategoryGrid } from "@/components/categories/category-card";
import { Section, SectionHeading } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/state";
import { load } from "@/lib/data";
import { getCategories } from "@/lib/queries/public";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await load(() => getCategories(), []);

  return (
    <Section className="pt-14 sm:pt-16">
      <SectionHeading eyebrow="Browse" title="Categories" description="Every project sorted into the kind of work it is." />
      <div className="mt-10">
        {categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <EmptyState title="No categories yet" description="Categories will appear here once they're added." showHomeLink />
        )}
      </div>
    </Section>
  );
}
