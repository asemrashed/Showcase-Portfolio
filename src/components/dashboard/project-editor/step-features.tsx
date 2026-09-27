"use client";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

export function StepFeatures({ control, register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "features" });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Highlight what the project can do. Icon names match Lucide icon components (e.g. "ShieldCheck").</p>
      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] border border-border p-4 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-start">
          <FormField label="Title" htmlFor={`feat-${i}-title`}>
            <Input id={`feat-${i}-title`} {...register(`features.${i}.title`)} />
          </FormField>
          <FormField label="Description" htmlFor={`feat-${i}-desc`} optional>
            <Input id={`feat-${i}-desc`} {...register(`features.${i}.description`)} />
          </FormField>
          <FormField label="Icon" htmlFor={`feat-${i}-icon`} optional>
            <Input id={`feat-${i}-icon`} placeholder="Sparkle" {...register(`features.${i}.icon`)} />
          </FormField>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove feature" className="mt-6 justify-self-end" onClick={() => remove(i)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" className="self-start" onClick={() => append({ title: "", description: "", icon: "" })}>
        <Plus className="size-4" />
        Add feature
      </Button>
    </div>
  );
}
