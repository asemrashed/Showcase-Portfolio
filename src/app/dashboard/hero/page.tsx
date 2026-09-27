"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GalleryHorizontal } from "lucide-react";
import { heroSlideSchema, type HeroSlideInput } from "@/lib/schemas/hero";
import { createHeroSlideAction, updateHeroSlideAction, deleteHeroSlideAction, reorderHeroSlidesAction } from "@/actions/hero";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardHeroSlide } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Select, Switch } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReorderableList } from "@/components/dashboard/reorderable-list";
import { ImageUploader, type ImageRefValue } from "@/components/dashboard/image-uploader";
import { Badge } from "@/components/ui/badge";

export default function HeroPage() {
  const qc = useQueryClient();
  const { data: slides, isLoading, isError, refetch } = useQuery({ queryKey: dqk.hero, queryFn: dashboardApi.heroSlides });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardHeroSlide | null>(null);
  const [deleting, setDeleting] = useState<DashboardHeroSlide | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: dqk.hero });

  const reorderMutation = useMutation({
    mutationFn: async (items: DashboardHeroSlide[]) =>
      unwrap(await reorderHeroSlidesAction({ items: items.map((it, i) => ({ id: it.id, order: i })) })),
    onError: () => {
      toast.error("Couldn't save the new order");
      invalidate();
    },
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async (s: DashboardHeroSlide) => unwrap(await updateHeroSlideAction(s.id, { active: !s.active })),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't update slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteHeroSlideAction(id)),
    onSuccess: () => {
      toast.success("Slide deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete slide"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag to reorder. Only active slides show on the homepage.</p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New slide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load hero slides" action={{ label: "Try again", onClick: () => refetch() }} />
      ) : !slides || slides.length === 0 ? (
        <EmptyState icon={GalleryHorizontal} title="No hero slides yet" action={{ label: "New slide", onClick: () => setFormOpen(true) }} />
      ) : (
        <ReorderableList
          items={slides}
          rowKey={(s) => s.id}
          onReorder={(items) => reorderMutation.mutate(items)}
          renderItem={(s) => (
            <div className="flex items-center gap-3">
              <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-muted">
                <Image src={s.imageUrl} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  {!s.active && <Badge>Inactive</Badge>}
                </div>
                {s.project && <p className="truncate text-xs text-muted-foreground">Links to {s.project.name}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Switch checked={s.active} onCheckedChange={() => toggleMutation.mutate(s)} label={`Toggle ${s.title} active`} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${s.title}`}
                  onClick={() => {
                    setEditing(s);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${s.title}`} onClick={() => setDeleting(s)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {formOpen && (
        <HeroFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          slide={editing}
          onSaved={() => {
            invalidate();
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.title}"?`}
        description="This slide will be removed from the homepage immediately."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}

function HeroFormModal({
  open,
  onOpenChange,
  slide,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: DashboardHeroSlide | null;
  onSaved: () => void;
}) {
  const { data: projects } = useQuery({
    queryKey: dqk.projects({ pageSize: 100 }),
    queryFn: () => dashboardApi.projects({ pageSize: 100 }),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideInput>({
    resolver: formResolver<HeroSlideInput>(heroSlideSchema),
    defaultValues: {
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      ctaLabel: slide?.ctaLabel ?? "",
      ctaUrl: slide?.ctaUrl ?? "",
      projectId: slide?.projectId ?? null,
      active: slide?.active ?? true,
      image: slide?.imageUrl ? { url: slide.imageUrl, key: slide.imageKey, alt: slide.imageAlt } : undefined,
    },
  });
  const image = watch("image") as ImageRefValue;
  const active = watch("active");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = slide ? await updateHeroSlideAction(slide.id, data) : await createHeroSlideAction(data);
      unwrap(result);
      toast.success(slide ? "Slide updated" : "Slide created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={slide ? "Edit slide" : "New slide"} size="lg">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Image" htmlFor="hero-image" error={(errors.image as { message?: string } | undefined)?.message}>
          <ImageUploader value={image ?? null} onChange={(v) => v && setValue("image", v, { shouldDirty: true })} folder="hero" aspect="aspect-[16/9]" />
        </FormField>
        <FormField label="Title" htmlFor="hero-title" error={errors.title?.message}>
          <Input id="hero-title" aria-invalid={!!errors.title} {...register("title")} />
        </FormField>
        <FormField label="Subtitle" htmlFor="hero-subtitle" error={errors.subtitle?.message} optional>
          <Textarea id="hero-subtitle" rows={2} {...register("subtitle")} />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="CTA label" htmlFor="hero-cta-label" error={errors.ctaLabel?.message} optional>
            <Input id="hero-cta-label" placeholder="View project" {...register("ctaLabel")} />
          </FormField>
          <FormField label="CTA URL" htmlFor="hero-cta-url" error={errors.ctaUrl?.message} optional>
            <Input id="hero-cta-url" placeholder="/projects/my-project" {...register("ctaUrl")} />
          </FormField>
        </div>
        <FormField label="Linked project" htmlFor="hero-project" optional>
          <Select id="hero-project" {...register("projectId")}>
            <option value="">None</option>
            {projects?.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3.5">
          <span className="text-sm font-medium">Active</span>
          <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} label="Slide active" />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {slide ? "Save changes" : "Create slide"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
