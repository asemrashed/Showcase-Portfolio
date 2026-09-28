"use client";
import { useState } from "react";
import { useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

const MAX_LENGTH = 100;

/** One entry per line: trims, drops empties, caps length, de-dupes (case-insensitive). */
function parseLines(raw: string, existing: string[]): string[] {
  const seen = new Set(existing.map((v) => v.trim().toLowerCase()));
  const result: string[] = [];
  for (const line of raw.split("\n")) {
    const value = line.trim().slice(0, MAX_LENGTH);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

export function StepFeatures({ control, register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "features" });
  const [bulkText, setBulkText] = useState("");

  const current = useWatch({ control, name: "features" }) ?? [];
  const pending = parseLines(bulkText, current.map((f) => f?.title ?? ""));

  const addBulk = () => {
    if (pending.length === 0) return;
    append(pending.map((title) => ({ title })));
    setBulkText("");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Highlight what the project can do.</p>

      {/* Bulk add: one feature per line (press Enter after each), then click Add all */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-4">
        <FormField label="Add multiple features" htmlFor="feat-bulk">
          <textarea
            id="feat-bulk"
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            onKeyDown={(e) => {
              // Enter = new line. Ctrl/Cmd + Enter = add all.
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addBulk();
              }
            }}
            placeholder={"Secure checkout\nReal-time inventory\nAdmin dashboard"}
            className="w-full resize-y rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </FormField>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">One feature per line. Ctrl/Cmd + Enter to add.</span>
          <Button type="button" variant="secondary" disabled={pending.length === 0} onClick={addBulk}>
            <Plus className="size-4" />
            {pending.length > 0 ? `Add ${pending.length} features` : "Add all"}
          </Button>
        </div>
      </div>

      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] border border-border p-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <FormField label="Title" htmlFor={`feat-${i}-title`}>
            <Input id={`feat-${i}-title`} {...register(`features.${i}.title`)} />
          </FormField>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove feature" className="mt-6 justify-self-end" onClick={() => remove(i)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" className="self-start" onClick={() => append({ title: "" })}>
        <Plus className="size-4" />
        Add feature
      </Button>
    </div>
  );
}