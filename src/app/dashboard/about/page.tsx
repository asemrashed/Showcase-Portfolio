"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { aboutSchema, type AboutInput } from "@/lib/schemas/content";
import { updateAboutAction } from "@/actions/singletons";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { ImageUploader, type ImageRefValue } from "@/components/dashboard/image-uploader";
import { TagsInput } from "@/components/ui/tags-input";

export default function AboutPage() {
  const qc = useQueryClient();
  const { data: about, isLoading, isError, refetch } = useQuery({ queryKey: dqk.about, queryFn: dashboardApi.about });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AboutInput>({ resolver: formResolver<AboutInput>(aboutSchema), defaultValues: { title: "", description: "", stats: [], skills: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: "stats" });

  useEffect(() => {
    if (about) {
      reset({
        title: about.title,
        description: about.description,
        image: about.imageUrl ? { url: about.imageUrl, key: about.imageKey!, alt: about.imageAlt ?? "" } : null,
        stats: about.stats as { label: string; value: string }[],
        skills: (about.skills ?? []) as string[],
      });
    }
  }, [about, reset]);

  const image = watch("image") as ImageRefValue;
  const skills = watch("skills");

  const mutation = useMutation({
    mutationFn: async (data: AboutInput) => unwrap(await updateAboutAction(data)),
    onSuccess: () => {
      toast.success("About page updated");
      qc.invalidateQueries({ queryKey: dqk.about });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't save changes"),
  });

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (isError) return <ErrorState title="Couldn't load the About page" action={{ label: "Try again", onClick: () => refetch() }} />;

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="flex flex-col gap-5">
        <FormField label="Image" htmlFor="about-image" optional>
          <ImageUploader value={image ?? null} onChange={(v) => setValue("image", v, { shouldDirty: true })} folder="about" />
        </FormField>
        <FormField label="Title" htmlFor="about-title" error={errors.title?.message}>
          <Input id="about-title" aria-invalid={!!errors.title} {...register("title")} />
        </FormField>
        <FormField label="Description" htmlFor="about-desc" error={errors.description?.message}>
          <Textarea id="about-desc" rows={8} aria-invalid={!!errors.description} {...register("description")} />
        </FormField>

        <div>
          <span className="text-sm font-medium">Stats</span>
          <div className="mt-2 flex flex-col gap-2.5">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input placeholder="Label (e.g. Projects shipped)" {...register(`stats.${i}.label`)} />
                <Input placeholder="Value (e.g. 40+)" className="w-32" {...register(`stats.${i}.value`)} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove stat" onClick={() => remove(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => append({ label: "", value: "" })}>
              <Plus className="size-4" />
              Add stat
            </Button>
          </div>
        </div>

        <FormField label="Skills & tools" htmlFor="about-skills" optional>
          <TagsInput value={skills ?? []} onChange={(v) => setValue("skills", v, { shouldDirty: true })} />
        </FormField>

        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty} className="mt-1 self-start">
          <Save className="size-4" />
          Save changes
        </Button>
      </form>
    </Card>
  );
}
