"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Cpu } from "lucide-react";
import {
  technologySchema,
  TECHNOLOGY_CATEGORIES,
  TECHNOLOGY_CATEGORY_LABELS,
  type TechnologyInput,
} from "@/lib/schemas/technology";
import { createTechnologyAction, updateTechnologyAction, deleteTechnologyAction, reorderTechnologiesAction } from "@/actions/technologies";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardTechnology } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { IconField, type IconValue } from "@/components/dashboard/icon-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReorderableList } from "@/components/dashboard/reorderable-list";

/**
 * Reusable technology catalog: add once (name + optional icon + category), then every project's
 * Technologies step picks from this list instead of retyping the same names each time.
 * Open to Developer / Admin / Super Admin — a project's stack is added by whoever builds it.
 *
 * Grouped by category for display; drag-to-reorder happens within a category (each section
 * reindexes only its own items, so ordering across different categories never collides).
 */
export default function TechnologiesPage() {
  const qc = useQueryClient();
  const { data: technologies, isLoading, isError, refetch } = useQuery({ queryKey: dqk.technologies, queryFn: dashboardApi.technologies });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardTechnology | null>(null);
  const [deleting, setDeleting] = useState<DashboardTechnology | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: dqk.technologies });

  const reorderMutation = useMutation({
    mutationFn: async (items: DashboardTechnology[]) =>
      unwrap(await reorderTechnologiesAction({ items: items.map((it, i) => ({ id: it.id, order: i })) })),
    onError: () => {
      toast.error("Couldn't save the new order");
      invalidate();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteTechnologyAction(id)),
    onSuccess: () => {
      toast.success("Technology deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete technology"),
  });

  const groups = TECHNOLOGY_CATEGORIES.map((cat) => ({
    cat,
    label: TECHNOLOGY_CATEGORY_LABELS[cat],
    items: (technologies ?? []).filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add each technology once here, then pick it from the list in any project&apos;s Technologies step. Drag to reorder within a category.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New technology
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load technologies" action={{ label: "Try again", onClick: () => refetch() }} />
      ) : !technologies || technologies.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No technologies yet"
          description="Add the tech you use most often, then reuse it across every project."
          action={{ label: "New technology", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <div key={g.cat} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                {g.label} <span className="font-normal text-muted-foreground">({g.items.length})</span>
              </h2>
              <ReorderableList
                items={g.items}
                rowKey={(t) => t.id}
                onReorder={(items) => reorderMutation.mutate(items)}
                renderItem={(t) => (
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
                      {t.icon && /^https?:\/\//i.test(t.icon) ? (
                        <Image src={t.icon} alt="" width={36} height={36} className="size-full object-contain p-1" unoptimized />
                      ) : (
                        <Cpu className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      {t.icon && !/^https?:\/\//i.test(t.icon) && <p className="truncate text-xs text-muted-foreground">Icon name: {t.icon}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${t.name}`}
                        onClick={() => {
                          setEditing(t);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${t.name}`} onClick={() => setDeleting(t)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <TechnologyFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          technology={editing}
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
        description="Projects that already use this technology keep their entry; only the catalog listing is removed."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}

function TechnologyFormModal({
  open,
  onOpenChange,
  technology,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technology: DashboardTechnology | null;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TechnologyInput>({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      name: technology?.name ?? "",
      icon: technology?.icon ?? "",
      iconKey: technology?.iconKey ?? null,
      category: technology?.category ?? "OTHER",
    },
  });
  const iconValue: IconValue = { icon: watch("icon") ?? "", iconKey: watch("iconKey") ?? null };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = technology ? await updateTechnologyAction(technology.id, data) : await createTechnologyAction(data);
      unwrap(result);
      toast.success(technology ? "Technology updated" : "Technology created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={technology ? "Edit technology" : "New technology"} size="md">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Name" htmlFor="tech-name" error={errors.name?.message}>
          <Input id="tech-name" placeholder="Next.js" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Category" htmlFor="tech-category" error={errors.category?.message}>
          <Select id="tech-category" aria-invalid={!!errors.category} {...register("category")}>
            {TECHNOLOGY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {TECHNOLOGY_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Icon / logo" htmlFor="tech-icon" error={errors.icon?.message} optional>
          <IconField
            value={iconValue}
            onChange={(v) => {
              setValue("icon", v.icon, { shouldDirty: true });
              setValue("iconKey", v.iconKey, { shouldDirty: true });
            }}
          />
        </FormField>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {technology ? "Save changes" : "Create technology"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
