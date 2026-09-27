"use client";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

export function StepLinks({ register, errors }: { register: UseFormRegister<ProjectFormValues>; errors: FieldErrors<ProjectFormValues> }) {
  return (
    <div className="flex flex-col gap-5">
      <FormField label="Live URL" htmlFor="p-live" error={errors.liveUrl?.message as string | undefined} optional>
        <Input id="p-live" placeholder="https://example.com" {...register("liveUrl")} />
      </FormField>
      <FormField label="Demo login URL" htmlFor="p-demo" error={errors.demoUrl?.message as string | undefined} optional>
        <Input id="p-demo" placeholder="https://example.com/demo" {...register("demoUrl")} />
      </FormField>
      <FormField label="Repository URL" htmlFor="p-repo" error={errors.repoUrl?.message as string | undefined} optional>
        <Input id="p-repo" placeholder="https://github.com/…" {...register("repoUrl")} />
      </FormField>
    </div>
  );
}
