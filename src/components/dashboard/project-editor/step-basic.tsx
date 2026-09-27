"use client";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProjectFormValues } from "./types";

export function StepBasic({ register, errors }: { register: UseFormRegister<ProjectFormValues>; errors: FieldErrors<ProjectFormValues> }) {
  const { data: categories } = useQuery({ queryKey: dqk.categories, queryFn: dashboardApi.categories });

  return (
    <div className="flex flex-col gap-5">
      <FormField label="Project name" htmlFor="p-name" error={errors.name?.message as string | undefined}>
        <Input id="p-name" required {...register("name")} />
      </FormField>
      <FormField label="Slug" htmlFor="p-slug" error={errors.slug?.message as string | undefined} optional>
        <Input id="p-slug" placeholder="auto-generated if left blank" {...register("slug")} />
      </FormField>
      <FormField label="Category" htmlFor="p-category" error={errors.categoryId?.message as string | undefined}>
        <Select id="p-category" required {...register("categoryId")}>
          <option value="">Select a category…</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Short description" htmlFor="p-short" error={errors.shortDescription?.message as string | undefined}>
        <Textarea id="p-short" rows={2} maxLength={300} required {...register("shortDescription")} />
        <p className="mt-1 text-xs text-muted-foreground">Shown on project cards. 10–300 characters.</p>
      </FormField>
      <FormField label="Full description" htmlFor="p-full" error={errors.fullDescription?.message as string | undefined}>
        <Textarea id="p-full" rows={10} required {...register("fullDescription")} />
      </FormField>
    </div>
  );
}
