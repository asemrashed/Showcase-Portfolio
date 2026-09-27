"use client";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

export function StepPricing({ register, errors }: { register: UseFormRegister<ProjectFormValues>; errors: FieldErrors<ProjectFormValues> }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">All four fields are required before this project can be published.</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Min price (USD)" htmlFor="p-min-price" error={errors.minPrice?.message as string | undefined}>
          <Input id="p-min-price" type="number" min={0} {...register("minPrice", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Max price (USD)" htmlFor="p-max-price" error={errors.maxPrice?.message as string | undefined}>
          <Input id="p-max-price" type="number" min={0} {...register("maxPrice", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Min duration (days)" htmlFor="p-min-dur" error={errors.minDuration?.message as string | undefined}>
          <Input id="p-min-dur" type="number" min={1} {...register("minDuration", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Max duration (days)" htmlFor="p-max-dur" error={errors.maxDuration?.message as string | undefined}>
          <Input id="p-max-dur" type="number" min={1} {...register("maxDuration", { valueAsNumber: true })} />
        </FormField>
      </div>
    </div>
  );
}
