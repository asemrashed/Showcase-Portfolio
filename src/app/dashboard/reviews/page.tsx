"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, MessageSquareQuote } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/lib/schemas/review";
import { createReviewAction, updateReviewAction, deleteReviewAction, reorderReviewsAction } from "@/actions/reviews";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardReview } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Select, Switch } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ReorderableList } from "@/components/dashboard/reorderable-list";
import { ImageUploader, type ImageRefValue } from "@/components/dashboard/image-uploader";
import { cn, initials } from "@/lib/utils";

export default function ReviewsPage() {
  const qc = useQueryClient();
  const { data: reviews, isLoading, isError, refetch } = useQuery({ queryKey: dqk.reviews, queryFn: dashboardApi.reviews });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardReview | null>(null);
  const [deleting, setDeleting] = useState<DashboardReview | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: dqk.reviews });

  const reorderMutation = useMutation({
    mutationFn: async (items: DashboardReview[]) =>
      unwrap(await reorderReviewsAction({ items: items.map((it, i) => ({ id: it.id, order: i })) })),
    onError: () => {
      toast.error("Couldn't save the new order");
      invalidate();
    },
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async (r: DashboardReview) => unwrap(await updateReviewAction(r.id, { published: !r.published })),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't update review"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteReviewAction(id)),
    onSuccess: () => {
      toast.success("Review deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete review"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag to reorder. Only published reviews are public.</p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New review
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load reviews" action={{ label: "Try again", onClick: () => refetch() }} />
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No reviews yet" action={{ label: "New review", onClick: () => setFormOpen(true) }} />
      ) : (
        <ReorderableList
          items={reviews}
          rowKey={(r) => r.id}
          onReorder={(items) => reorderMutation.mutate(items)}
          renderItem={(r) => (
            <div className="flex items-center gap-3">
              <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-medium text-primary-text">
                {r.avatarUrl ? <Image src={r.avatarUrl} alt="" fill sizes="40px" className="object-cover" /> : initials(r.authorName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{r.authorName}</p>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("size-3", i < r.rating ? "fill-primary text-primary" : "fill-none text-border")} />
                    ))}
                  </span>
                  {!r.published && <Badge>Draft</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Switch checked={r.published} onCheckedChange={() => toggleMutation.mutate(r)} label={`Toggle ${r.authorName} published`} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit review by ${r.authorName}`}
                  onClick={() => {
                    setEditing(r);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Delete review by ${r.authorName}`} onClick={() => setDeleting(r)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {formOpen && (
        <ReviewFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          review={editing}
          onSaved={() => {
            invalidate();
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete review by "${deleting?.authorName}"?`}
        description="This can't be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}

function ReviewFormModal({
  open,
  onOpenChange,
  review,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: DashboardReview | null;
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: formResolver<ReviewInput>(reviewSchema),
    defaultValues: {
      authorName: review?.authorName ?? "",
      authorRole: review?.authorRole ?? "",
      company: review?.company ?? "",
      rating: review?.rating ?? 5,
      content: review?.content ?? "",
      projectId: review?.projectId ?? null,
      published: review?.published ?? false,
      avatar: review?.avatarUrl ? { url: review.avatarUrl, key: review.avatarKey! } : null,
    },
  });
  const avatar = watch("avatar") as { url: string; key: string } | null | undefined;
  const published = watch("published");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = review ? await updateReviewAction(review.id, data) : await createReviewAction(data);
      unwrap(result);
      toast.success(review ? "Review updated" : "Review created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={review ? "Edit review" : "New review"} size="lg">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Avatar" htmlFor="review-avatar" optional>
          <ImageUploader
            value={avatar ? { ...avatar, alt: review?.authorName ?? "" } : null}
            onChange={(v) => setValue("avatar", v ? { url: v.url, key: v.key } : null, { shouldDirty: true })}
            folder="avatars"
            aspect="aspect-square max-w-32"
            altRequired={false}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Author name" htmlFor="review-name" error={errors.authorName?.message}>
            <Input id="review-name" aria-invalid={!!errors.authorName} {...register("authorName")} />
          </FormField>
          <FormField label="Role" htmlFor="review-role" error={errors.authorRole?.message} optional>
            <Input id="review-role" {...register("authorRole")} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Company" htmlFor="review-company" error={errors.company?.message} optional>
            <Input id="review-company" {...register("company")} />
          </FormField>
          <FormField label="Rating" htmlFor="review-rating" error={errors.rating?.message}>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <div className="flex items-center gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" aria-label={`${n} star${n === 1 ? "" : "s"}`} onClick={() => field.onChange(n)}>
                      <Star className={cn("size-6 transition-colors", n <= field.value ? "fill-primary text-primary" : "fill-none text-border")} />
                    </button>
                  ))}
                </div>
              )}
            />
          </FormField>
        </div>
        <FormField label="Review content" htmlFor="review-content" error={errors.content?.message}>
          <Textarea id="review-content" rows={4} aria-invalid={!!errors.content} {...register("content")} />
        </FormField>
        <FormField label="Linked project" htmlFor="review-project" optional>
          <Select id="review-project" {...register("projectId")}>
            <option value="">None</option>
            {projects?.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3.5">
          <span className="text-sm font-medium">Published</span>
          <Switch checked={published} onCheckedChange={(v) => setValue("published", v)} label="Review published" />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {review ? "Save changes" : "Create review"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
