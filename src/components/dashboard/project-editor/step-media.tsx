"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X, GripVertical } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectImageAction, removeProjectImageAction, reorderProjectImagesAction } from "@/actions/projects";
import { unwrap } from "@/lib/api/action-result";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { Input } from "@/components/ui/input";
import { dqk } from "@/lib/api/dashboard";
import type { DashboardProjectFull } from "@/types/dashboard";
import { cn } from "@/lib/utils";

type ProjectImage = NonNullable<DashboardProjectFull>["images"][number];
type ImageType = "MAIN" | "DESKTOP" | "MOBILE" | "EXTRA";

function Slot({ projectId, image, type, label, aspect }: { projectId: string; image?: ProjectImage; type: ImageType; label: string; aspect: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const qc = useQueryClient();
  const router = useRouter();
  const { upload, isUploading } = useImageUpload("projects");
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: dqk.project(projectId) });
    router.refresh();
  };

  const replace = useMutation({
    mutationFn: async (file: File) => {
      const asset = await upload(file);
      if (image) unwrap(await removeProjectImageAction(projectId, image.id));
      unwrap(await addProjectImageAction(projectId, { ...asset, alt: image?.alt || file.name || "Project image", type }));
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const replaceUrl = useMutation({
    mutationFn: async (url: string) => {
      if (image) unwrap(await removeProjectImageAction(projectId, image.id));
      unwrap(await addProjectImageAction(projectId, { url, key: url, alt: image?.alt || "External image", type }));
    },
    onSuccess: () => { setUrlInput(""); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save URL"),
  });

  const updateAlt = useMutation({
    mutationFn: async (alt: string) => {
      if (!image) return;
      unwrap(await removeProjectImageAction(projectId, image.id));
      unwrap(await addProjectImageAction(projectId, { url: image.url, key: image.key, alt, type }));
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!image) return;
      unwrap(await removeProjectImageAction(projectId, image.id));
    },
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't remove image"),
  });

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      replaceUrl.mutate(urlInput.trim());
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border bg-muted", aspect)}>
        {image ? (
          <>
            <Image src={image.url} alt={image.alt} fill sizes="320px" className="object-cover" />
            <button type="button" aria-label={`Remove ${label}`} onClick={() => remove.mutate()} className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={replace.isPending || replaceUrl.isPending || isUploading} className="flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed">
              {replace.isPending || replaceUrl.isPending || isUploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
              {replace.isPending || replaceUrl.isPending || isUploading ? "Saving…" : "Click to upload file"}
            </button>
            <div className="flex w-full max-w-[240px] items-center gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste URL here..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                disabled={replaceUrl.isPending || replace.isPending || isUploading}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={replaceUrl.isPending || replace.isPending || isUploading}
                className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => e.target.files?.[0] && replace.mutate(e.target.files[0])} />
      </div>
      {image && (
        <>
          <Input defaultValue={image.alt} onBlur={(e) => e.target.value !== image.alt && updateAlt.mutate(e.target.value)} placeholder="Alt text" aria-label={`${label} alt text`} />
          <button type="button" onClick={() => inputRef.current?.click()} className="self-start text-xs font-medium text-primary-text hover:underline">
            Replace image
          </button>
        </>
      )}
    </div>
  );
}

function ExtraGallery({ projectId, images }: { projectId: string; images: ProjectImage[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const qc = useQueryClient();
  const router = useRouter();
  const { upload, isUploading } = useImageUpload("projects");
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: dqk.project(projectId) });
    router.refresh();
  };

  const add = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const asset = await upload(file);
        unwrap(await addProjectImageAction(projectId, { ...asset, alt: file.name || "Extra project image", type: "EXTRA" }));
      }
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });
  
  const addUrl = useMutation({
    mutationFn: async (url: string) => {
      unwrap(await addProjectImageAction(projectId, { url, key: url, alt: "External image", type: "EXTRA" }));
    },
    onSuccess: () => { setUrlInput(""); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add URL"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await removeProjectImageAction(projectId, id)),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't remove image"),
  });
  const reorder = useMutation({
    mutationFn: async (items: ProjectImage[]) => unwrap(await reorderProjectImagesAction(projectId, { items: items.map((it, i) => ({ id: it.id, order: i })) })),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't save order"),
  });
  const { handlers, dragIndex, overIndex } = useDragReorder(images, (next) => reorder.mutate(next));

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      addUrl.mutate(urlInput.trim());
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Extra screenshots</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.id} {...handlers(i)} className={cn("relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted", dragIndex === i && "opacity-50", overIndex === i && dragIndex !== i && "border-primary")}>
            <Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" />
            <span className="absolute left-1.5 top-1.5 flex size-6 cursor-grab items-center justify-center rounded-full bg-black/50 text-white" aria-hidden>
              <GripVertical className="size-3.5" />
            </span>
            <button type="button" aria-label="Remove image" onClick={() => remove.mutate(img.id)} className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={add.isPending || addUrl.isPending || isUploading}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-border text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
          >
            {add.isPending || addUrl.isPending || isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            Upload file
          </button>
          <div className="flex items-center gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or URL..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
              disabled={addUrl.isPending || add.isPending || isUploading}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={addUrl.isPending || add.isPending || isUploading}
              className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => e.target.files && add.mutate(e.target.files)} />
    </div>
  );
}

export function StepMedia({ projectId, images }: { projectId: string | null; images: ProjectImage[] }) {
  if (!projectId) {
    return <p className="rounded-[var(--radius-md)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Save the Basic step first to unlock media uploads.</p>;
  }
  const main = images.find((i) => i.type === "MAIN");
  const desktop = images.find((i) => i.type === "DESKTOP");
  const mobile = images.find((i) => i.type === "MOBILE");
  const extra = images.filter((i) => i.type === "EXTRA");

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Slot projectId={projectId} image={main} type="MAIN" label="Main image (required to publish)" aspect="aspect-[4/3]" />
        <Slot projectId={projectId} image={desktop} type="DESKTOP" label="Desktop landing screenshot" aspect="aspect-[4/3]" />
        <Slot projectId={projectId} image={mobile} type="MOBILE" label="Mobile screenshot" aspect="aspect-[9/16]" />
      </div>
      <ExtraGallery projectId={projectId} images={extra} />
    </div>
  );
}
