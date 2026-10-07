import * as Icons from "lucide-react";
import { Sparkle, CheckCircle2 } from "lucide-react";
import type { ProjectDetailData } from "@/types/api";

type FeatureItem = ProjectDetailData["features"][number];

function FeatureIcon({ name }: { name: string | null }) {
  if (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) {
    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
    return <Icon className="size-[1.125rem] shrink-0 text-primary mt-0.5" strokeWidth={2} aria-hidden />;
  }
  return <Sparkle className="size-[1.125rem] shrink-0 text-primary mt-0.5" strokeWidth={2} aria-hidden />;
}

export function FeaturesGrid({ features }: { features: FeatureItem[] }) {
  if (!features || features.length === 0) return null;

  // Group features by groupName while preserving original insertion order
  const groupedMap = new Map<string, FeatureItem[]>();
  const UNGROUPED_KEY = "__ungrouped__";

  for (const feature of features) {
    const key = feature.groupName?.trim() ? feature.groupName.trim() : UNGROUPED_KEY;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, []);
    }
    groupedMap.get(key)!.push(feature);
  }

  // If there are no groups (all ungrouped), render a single clean 2-column list
  const hasGroups = Array.from(groupedMap.keys()).some((k) => k !== UNGROUPED_KEY);

  if (!hasGroups) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <FeatureIcon name={f.icon} />
            <div className="flex flex-col">
              <span className="text-[15.5px] font-medium text-foreground leading-snug">
                {f.title}
              </span>
              {f.description && (
                <span className="mt-0.5 text-sm text-muted-foreground leading-normal">
                  {f.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Array.from(groupedMap.entries()).map(([groupKey, groupFeatures]) => {
        const isUngrouped = groupKey === UNGROUPED_KEY;

        return (
          <div key={groupKey} className="space-y-3.5">
            {!isUngrouped && (
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {groupKey}
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {groupFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <FeatureIcon name={f.icon} />
                  <div className="flex flex-col">
                    <span className="text-[15.5px] font-medium text-foreground leading-snug">
                      {f.title}
                    </span>
                    {f.description && (
                      <span className="mt-0.5 text-sm text-muted-foreground leading-normal">
                        {f.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
