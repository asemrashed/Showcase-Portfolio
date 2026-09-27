"use client";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiImageUploader } from "@/components/dashboard/multi-image-uploader";
import type { ProjectFormValues, RoleImage } from "./types";

export function StepRoles({ control, register }: { control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues> }) {
  const { fields, append, remove, update } = useFieldArray({ control, name: "roles" });

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Add a role per user type (e.g. Admin, Instructor, Student) with its own screenshots.</p>
      {fields.map((field, i) => (
        <div key={field.id} className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border p-5">
          <div className="flex items-start gap-3">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Role name" htmlFor={`role-${i}-name`}>
                <Input id={`role-${i}-name`} {...register(`roles.${i}.name`)} />
              </FormField>
              <FormField label="Description" htmlFor={`role-${i}-desc`} optional>
                <Input id={`role-${i}-desc`} {...register(`roles.${i}.description`)} />
              </FormField>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Remove role" className="mt-6" onClick={() => remove(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div>
            <span className="text-sm font-medium">Screenshots</span>
            <div className="mt-2">
              <MultiImageUploader<RoleImage>
                items={(field.images as RoleImage[]) ?? []}
                onChange={(images) => update(i, { ...field, images })}
                folder="projects"
                makeItem={(asset) => ({ ...asset, device: "DESKTOP" })}
                renderExtra={(item, patch) => (
                  <Select value={item.device} onChange={(e) => patch({ device: e.target.value as "DESKTOP" | "MOBILE" })} className="w-32">
                    <option value="DESKTOP">Desktop</option>
                    <option value="MOBILE">Mobile</option>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" className="self-start" onClick={() => append({ name: "", description: "", images: [] })}>
        <Plus className="size-4" />
        Add role
      </Button>
    </div>
  );
}
