"use client";
import { useState } from "react";
import { useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

const MAX_LENGTH = 100;

/** Splits on newlines and commas (tech names rarely contain commas), de-dupes case-insensitively. */
function parseNames(raw: string, existing: string[]): string[] {
  const seen = new Set(existing.map((v) => v.trim().toLowerCase()));
  const result: string[] = [];
  for (const part of raw.split(/[\n,]/)) {
    const value = part.trim().slice(0, MAX_LENGTH);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

export function StepTechnologies({ control, register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "technologies" });
  const [bulkText, setBulkText] = useState("");

  const current = useWatch({ control, name: "technologies" }) ?? [];
  const pending = parseNames(bulkText, current.map((t) => t?.name ?? ""));

  const addBulk = () => {
    if (pending.length === 0) return;
    append(pending.map((name) => ({ name, icon: "" })));
    setBulkText("");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Add the stack in bulk first, then set an icon on any item if you want one.</p>

      <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-4">
        <FormField label="Add multiple technologies" htmlFor="tech-bulk">
          <textarea
            id="tech-bulk"
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addBulk();
              }
            }}
            placeholder={"Next.js\nPrisma\nPostgreSQL"}
            className="w-full resize-y rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </FormField>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">One per line (commas work too). Ctrl/Cmd + Enter to add.</span>
          <Button type="button" variant="secondary" disabled={pending.length === 0} onClick={addBulk}>
            <Plus className="size-4" />
            {pending.length > 0 ? `Add ${pending.length} technologies` : "Add all"}
          </Button>
        </div>
      </div>

      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] border border-border p-4 sm:grid-cols-[1fr_180px_auto] sm:items-start">
          <FormField label="Name" htmlFor={`tech-${i}-name`}>
            <Input id={`tech-${i}-name`} {...register(`technologies.${i}.name`)} />
          </FormField>
          <FormField label="Icon" htmlFor={`tech-${i}-icon`} optional>
            <Input id={`tech-${i}-icon`} placeholder="Sparkle" {...register(`technologies.${i}.icon`)} />
          </FormField>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove technology" className="mt-6 justify-self-end" onClick={() => remove(i)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" className="self-start" onClick={() => append({ name: "", icon: "" })}>
        <Plus className="size-4" />
        Add technology
      </Button>
    </div>
  );
}