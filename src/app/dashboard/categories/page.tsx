"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tags as TagsIcon } from "lucide-react";
import { categorySchema, type CategoryInput } from "@/lib/schemas/category";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction, reorderCategorysAction } from "@/actions/categories";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardCategory } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReorderableList } from "@/components/dashboard/reorderable-list";
import { ImageUploader, type ImageRefValue } from "@/components/dashboard/image-uploader";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories, isLoading, isError, refetch } = useQuery({ queryKey: dqk.categories, queryFn: dashboardApi.categories });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardCategory | null>(null);
  const [deleting, setDeleting] = useState<DashboardCategory | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: dqk.categories });

  const reorderMutation = useMutation({
    mutationFn: async (items: DashboardCategory[]) =>
      unwrap(await reorderCategorysAction({ items: items.map((it, i) => ({ id: it.id, order: i })) })),
    onError: () => {
      toast.error("Couldn't save the new order");
      invalidate();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteCategoryAction(id)),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete category"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag to reorder how categories appear on the public site.</p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load categories" action={{ label: "Try again", onClick: () => refetch() }} />
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={TagsIcon}
          title="No categories yet"
          description="Create your first category to start organizing projects."
          action={{ label: "New category", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <ReorderableList
          items={categories}
          rowKey={(c) => c.id}
          onReorder={(items) => reorderMutation.mutate(items)}
          renderItem={(c) => (
            <div className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-muted">
                {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  /{c.slug} · {c._count.projects} {c._count.projects === 1 ? "project" : "projects"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${c.name}`}
                  onClick={() => {
                    setEditing(c);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {formOpen && (
        <CategoryFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          category={editing}
          onSaved={() => {
            invalidate();
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This can't be undone. Projects in this category will need to be reassigned."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}

function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: DashboardCategory | null;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image: category?.imageUrl ? { url: category.imageUrl, key: category.imageKey!, alt: category.imageAlt ?? "" } : null,
    },
  });
  const image = watch("image") as ImageRefValue;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = category ? await updateCategoryAction(category.id, data) : await createCategoryAction(data);
      unwrap(result);
      toast.success(category ? "Category updated" : "Category created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={category ? "Edit category" : "New category"} size="md">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Name" htmlFor="cat-name" error={errors.name?.message}>
          <Input id="cat-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Slug" htmlFor="cat-slug" error={errors.slug?.message} optional>
          <Input id="cat-slug" placeholder="auto-generated if left blank" aria-invalid={!!errors.slug} {...register("slug")} />
        </FormField>
        <FormField label="Description" htmlFor="cat-desc" error={errors.description?.message} optional>
          <Textarea id="cat-desc" rows={3} {...register("description")} />
        </FormField>
        <FormField label="Image" htmlFor="cat-image" optional>
          <ImageUploader value={image ?? null} onChange={(v) => setValue("image", v, { shouldDirty: true })} folder="categories" />
        </FormField>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
