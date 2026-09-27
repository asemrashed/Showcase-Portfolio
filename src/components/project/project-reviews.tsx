import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { load } from "@/lib/data";
import { getReviews } from "@/lib/queries/public";

const ReviewCarousel = dynamic(() => import("@/components/home/review-carousel").then((m) => m.ReviewCarousel), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export async function ProjectReviews({ slug }: { slug: string }) {
  const reviews = await load(() => getReviews({ projectSlug: slug, limit: 12 }), []);
  if (reviews.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Reviews for this project</h2>
      <div className="mt-8">
        <ReviewCarousel reviews={reviews} />
      </div>
    </div>
  );
}
