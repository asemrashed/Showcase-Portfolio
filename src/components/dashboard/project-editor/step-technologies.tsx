"use client";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

export function StepTechnologies({ control, register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "technologies" });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">At least one technology is required before this project can be published.</p>
      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] border border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
          <FormField label="Name" htmlFor={`tech-${i}-name`}>
            <Input id={`tech-${i}-name`} placeholder="Next.js" {...register(`technologies.${i}.name`)} />
          </FormField>
          <FormField label="Icon" htmlFor={`tech-${i}-icon`} optional>
            <Input id={`tech-${i}-icon`} placeholder="nextjs" {...register(`technologies.${i}.icon`)} />
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
