"use client";
import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import type { ProjectFormValues } from "./types";

export function StepSeo({
  register,
  watch,
  setValue,
  errors,
}: {
  register: UseFormRegister<ProjectFormValues>;
  watch: UseFormWatch<ProjectFormValues>;
  setValue: UseFormSetValue<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
}) {
  const ogImage = watch("ogImage") as { url: string; key: string } | null | undefined;

  return (
    <div className="flex flex-col gap-5">
      <FormField label="Meta title" htmlFor="p-meta-title" error={errors.metaTitle?.message as string | undefined} optional>
        <Input id="p-meta-title" maxLength={70} {...register("metaTitle")} />
      </FormField>
      <FormField label="Meta description" htmlFor="p-meta-desc" error={errors.metaDescription?.message as string | undefined} optional>
        <Textarea id="p-meta-desc" rows={3} maxLength={170} {...register("metaDescription")} />
      </FormField>
      <FormField label="OG image" htmlFor="p-og" optional>
        <ImageUploader
          value={ogImage ? { ...ogImage, alt: "" } : null}
          onChange={(v) => setValue("ogImage", v ? { url: v.url, key: v.key } : null, { shouldDirty: true })}
          folder="projects"
          aspect="aspect-[1.91/1]"
          altRequired={false}
        />
      </FormField>
    </div>
  );
}
