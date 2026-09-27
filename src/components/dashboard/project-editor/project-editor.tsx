"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Send, Rocket, Undo2, Archive, Trash2 } from "lucide-react";
import type { UserRole } from "@prisma/client";
import {
  createProjectAction,
  updateProjectAction,
  submitProjectAction,
  publishProjectAction,
  rejectProjectAction,
  archiveProjectAction,
  restoreProjectAction,
  deleteProjectAction,
} from "@/actions/projects";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { dqk } from "@/lib/api/dashboard";
import type { DashboardProjectFull } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";
import { STEP_LABELS, type ProjectFormValues, type StepId } from "./types";
import { StepBasic } from "./step-basic";
import { StepMedia } from "./step-media";
import { StepRoles } from "./step-roles";
import { StepFeatures } from "./step-features";
import { StepTechnologies } from "./step-technologies";
import { StepLinks } from "./step-links";
import { StepSeo } from "./step-seo";
import { StepPricing } from "./step-pricing";

function toFormValues(p: NonNullable<DashboardProjectFull> | null): Partial<ProjectFormValues> {
  if (!p) return { roles: [], features: [], technologies: [] };
  return {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    categoryId: p.categoryId,
    liveUrl: p.liveUrl ?? "",
    demoUrl: p.demoUrl ?? "",
    repoUrl: p.repoUrl ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    ogImage: p.ogImageUrl ? { url: p.ogImageUrl, key: p.ogImageKey! } : null,
    roles: p.roles.map((r) => ({ name: r.name, description: r.description ?? "", images: r.images.map((im) => ({ url: im.url, key: im.key, alt: im.alt, device: im.device })) })),
    features: p.features.map((f) => ({ title: f.title, description: f.description, icon: f.icon })),
    technologies: p.technologies.map((t) => ({ name: t.name, icon: t.icon })),
    minPrice: p.minPrice ?? undefined,
    maxPrice: p.maxPrice ?? undefined,
    minDuration: p.minDuration ?? undefined,
    maxDuration: p.maxDuration ?? undefined,
  };
}

export function ProjectEditor({ projectId, project, role }: { projectId: string | null; project: NonNullable<DashboardProjectFull> | null; role: UserRole }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const steps: StepId[] = isAdmin ? [...STEP_LABELS, "Pricing"] : [...STEP_LABELS];
  const [step, setStep] = useState<StepId>("Basic");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({ defaultValues: toFormValues(project) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["dashboard", "projects"] });
    if (projectId) qc.invalidateQueries({ queryKey: dqk.project(projectId) });
    router.refresh();
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (projectId) return unwrap(await updateProjectAction(projectId, data));
      return unwrap(await createProjectAction(data));
    },
    onSuccess: (saved) => {
      toast.success("Saved");
      invalidate();
      if (!projectId) router.push(`/dashboard/projects/${saved.id}/edit`);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't save project"),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("Save the project first");
      await unwrap(await updateProjectAction(projectId, watch()));
      return unwrap(await submitProjectAction(projectId));
    },
    onSuccess: () => {
      toast.success("Submitted for review");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't submit project"),
  });

  const publishMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (!projectId) throw new Error("Save the project first");
      await unwrap(await updateProjectAction(projectId, data));
      return unwrap(
        await publishProjectAction(projectId, {
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          minDuration: data.minDuration,
          maxDuration: data.maxDuration,
        }),
      );
    },
    onSuccess: () => {
      toast.success("Project published");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't publish — check pricing and media are complete"),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) return;
      return unwrap(await rejectProjectAction(projectId, { note: rejectNote }));
    },
    onSuccess: () => {
      toast.success("Sent back to draft");
      setRejectOpen(false);
      setRejectNote("");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't reject project"),
  });

  const archiveMutation = useMutation({
    mutationFn: async () => (projectId ? unwrap(await archiveProjectAction(projectId)) : undefined),
    onSuccess: () => {
      toast.success("Project archived");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't archive project"),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => (projectId ? unwrap(await restoreProjectAction(projectId)) : undefined),
    onSuccess: () => {
      toast.success("Project restored to draft");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't restore project"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (projectId ? unwrap(await deleteProjectAction(projectId)) : undefined),
    onSuccess: () => {
      toast.success("Project deleted");
      router.push("/dashboard/projects");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete project"),
  });

  const status = project?.status;
  const isOwnerDraftFlow = status === "DRAFT" || !projectId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {status && <StatusBadge status={status} />}
          {project && <span className="text-sm text-muted-foreground">Last updated {new Date(project.updatedAt).toLocaleString()}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === "PENDING" && isAdmin && (
            <Button variant="secondary" size="sm" onClick={() => setRejectOpen(true)}>
              <Undo2 className="size-4" />
              Send back to draft
            </Button>
          )}
          {status === "PUBLISHED" && isAdmin && (
            <Button variant="secondary" size="sm" loading={archiveMutation.isPending} onClick={() => archiveMutation.mutate()}>
              <Archive className="size-4" />
              Archive
            </Button>
          )}
          {status === "ARCHIVED" && isAdmin && (
            <Button variant="secondary" size="sm" loading={restoreMutation.isPending} onClick={() => restoreMutation.mutate()}>
              <Undo2 className="size-4" />
              Restore to draft
            </Button>
          )}
          {projectId && (isAdmin || status === "DRAFT") && (
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-px no-scrollbar">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              step === s ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {step === "Basic" && <StepBasic register={register} errors={errors} />}
        {step === "Media" && <StepMedia projectId={projectId} images={project?.images ?? []} />}
        {step === "Roles" && <StepRoles control={control} register={register} />}
        {step === "Features" && <StepFeatures control={control} register={register} />}
        {step === "Technologies" && <StepTechnologies control={control} register={register} />}
        {step === "Links" && <StepLinks register={register} errors={errors} />}
        {step === "SEO" && <StepSeo register={register} watch={watch} setValue={setValue} errors={errors} />}
        {step === "Pricing" && isAdmin && <StepPricing register={register} errors={errors} />}
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {isOwnerDraftFlow && !isAdmin && (
          <Button variant="secondary" loading={submitMutation.isPending} onClick={() => submitMutation.mutate()} disabled={!projectId}>
            <Send className="size-4" />
            Submit for review
          </Button>
        )}
        {(status === "PENDING" || (isOwnerDraftFlow && isAdmin)) && isAdmin && (
          <Button loading={publishMutation.isPending} onClick={handleSubmit((d) => publishMutation.mutate(d))} disabled={!projectId}>
            <Rocket className="size-4" />
            {status === "PENDING" ? "Accept (Publish)" : "Publish"}
          </Button>
        )}
        <Button variant={isOwnerDraftFlow ? "primary" : "secondary"} loading={saveMutation.isPending} onClick={handleSubmit((d) => saveMutation.mutate(d))}>
          <Save className="size-4" />
          Save draft
        </Button>
      </div>

      <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Send back to draft" description="Let the developer know what needs fixing.">
        <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={4} placeholder="What needs to change before this can be published?" />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={rejectMutation.isPending} disabled={rejectNote.trim().length < 3} onClick={() => rejectMutation.mutate()}>
            Send back
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this project?"
        description="This can't be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
