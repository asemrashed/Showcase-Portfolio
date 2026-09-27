import * as Icons from "lucide-react";
import { Sparkle } from "lucide-react";
import type { ProjectDetailData } from "@/types/api";

function FeatureIcon({ name }: { name: string | null }) {
  const Icon = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Sparkle;
  return <Icon className="size-5" aria-hidden />;
}

export function FeaturesGrid({ features }: { features: ProjectDetailData["features"] }) {
  if (features.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {features.map((f) => (
        <div key={f.title} className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary-text">
            <FeatureIcon name={f.icon} />
          </span>
          <div>
            <h3 className="text-sm font-medium">{f.title}</h3>
            {f.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
