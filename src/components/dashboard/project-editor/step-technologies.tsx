"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";
import { Check, ExternalLink, Search } from "lucide-react";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { TECHNOLOGY_CATEGORIES, TECHNOLOGY_CATEGORY_LABELS, type TechnologyCategoryValue } from "@/lib/schemas/technology";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProjectFormValues } from "./types";

/**
 * Technologies are picked from the shared catalog (managed once under Dashboard → Technologies)
 * instead of being typed out per project. Selecting a row snapshots its current name + icon into
 * this project's technologies list; later renames in the catalog won't retroactively change it.
 */
export function StepTechnologies({ control, register: _register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { data: catalog, isLoading } = useQuery({ queryKey: dqk.technologies, queryFn: dashboardApi.technologies });
  const { fields, append, remove } = useFieldArray({ control, name: "technologies" });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TechnologyCategoryValue | "">("");

  const selected = useWatch({ control, name: "technologies" }) ?? [];
  const selectedNames = new Set(selected.map((t) => t?.name?.trim().toLowerCase()).filter(Boolean));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = catalog ?? [];
    if (category) list = list.filter((t) => t.category === category);
    if (q) list = list.filter((t) => t.name.toLowerCase().includes(q));
    return list;
  }, [catalog, search, category]);

  // Group filtered results by category, in the catalog's fixed category order, skipping empty groups.
  const groups = useMemo(
    () =>
      TECHNOLOGY_CATEGORIES.map((cat) => ({
        cat,
        label: TECHNOLOGY_CATEGORY_LABELS[cat],
        items: filtered.filter((t) => t.category === cat),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  const toggle = (name: string, icon: string | null) => {
    const key = name.trim().toLowerCase();
    const existingIndex = fields.findIndex((f, i) => (selected[i]?.name ?? f.name)?.trim().toLowerCase() === key);
    if (existingIndex >= 0) remove(existingIndex);
    else append({ name, icon: icon ?? "" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Select every technology this project uses. Selected items keep their order below.</p>
        <Link href="/dashboard/technologies" target="_blank" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary-text hover:underline">
          Manage catalog
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search technologies..." className="pl-9" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value as TechnologyCategoryValue | "")} className="sm:w-56" aria-label="Filter by category">
          <option value="">All categories</option>
          {TECHNOLOGY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {TECHNOLOGY_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !catalog || catalog.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No technologies in the catalog yet.{" "}
          <Link href="/dashboard/technologies" target="_blank" className="font-medium text-primary-text hover:underline">
            Add some
          </Link>{" "}
          — you only need to do it once, then reuse them on every project.
        </p>
      ) : groups.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No match for the current search / filter.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <div key={g.cat} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {g.items.map((t) => {
                  const isSelected = selectedNames.has(t.name.trim().toLowerCase());
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggle(t.name, t.icon)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors",
                        isSelected ? "border-primary bg-primary-soft text-primary-text" : "border-border hover:bg-muted",
                      )}
                    >
                      <span className="truncate">{t.name}</span>
                      {isSelected && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-4">
          {fields.map((field, i) => (
            <span key={field.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {selected[i]?.name ?? field.name}
              <button type="button" aria-label={`Remove ${selected[i]?.name ?? field.name}`} onClick={() => remove(i)} className="cursor-pointer text-muted-foreground hover:text-foreground">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
