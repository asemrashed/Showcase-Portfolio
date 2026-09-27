"use client";
import { useFieldArray, type Control, type FieldValues, type Path, type ArrayPath, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

export function SocialsField<T extends FieldValues>({
  control,
  register,
  name,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  name: ArrayPath<T>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: name as ArrayPath<T> });

  return (
    <div className="flex flex-col gap-2.5">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input placeholder="Platform (github, linkedin…)" className="w-40 shrink-0" {...register(`${name}.${i}.platform` as Path<T>)} />
          <Input placeholder="https://…" {...register(`${name}.${i}.url` as Path<T>)} />
          <Button type="button" variant="ghost" size="icon" aria-label="Remove social link" onClick={() => remove(i)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => append({ platform: "", url: "" } as never)}>
        <Plus className="size-4" />
        Add social link
      </Button>
    </div>
  );
}
