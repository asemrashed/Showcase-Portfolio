import { formatPriceRange, formatDuration } from "@/lib/utils";
import type { ProjectDetailData } from "@/types/api";

export function PricingBlock({ pricing, currency }: { pricing: ProjectDetailData["pricing"]; currency: string }) {
  if (!pricing) return null;

  return (
    <div className="flex flex-wrap gap-8 rounded-[var(--radius-lg)] border border-border bg-surface p-6 lg:hidden">
      <div>
        <p className="text-xs text-muted-foreground">Estimated price</p>
        <p className="mt-1 text-lg font-medium font-display">{formatPriceRange(pricing.minPrice, pricing.maxPrice, currency)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Typical duration</p>
        <p className="mt-1 text-lg font-medium font-display">{formatDuration(pricing.minDuration, pricing.maxDuration)}</p>
      </div>
    </div>
  );
}
