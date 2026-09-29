"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectImageAction, removeProjectImageAction } from "@/actions/projects";
import { unwrap } from "@/lib/api/action-result";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Input } from "@/components/ui/input";
import { dqk } from "@/lib/api/dashboard";
import type { DashboardProjectFull } from "@/types/dashboard";
import { cn } from "@/lib/utils";

type ProjectImage = NonNullable<DashboardProjectFull>["images"][number];
type ImageType = "DESKTOP" | "MOBILE";

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
      unwrap(await addProjectImageAction(projectId, { ...asset, alt: image?.alt || file.name || "Project screenshot", type }));
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
      <p className="text-xs text-muted-foreground">Upload the full page — it doesn&apos;t need to fit one screen, it scrolls in place on the site.</p>
      <div className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted", aspect)}>
        {image ? (
          <>
            <Image src={image.url} alt={image.alt} fill sizes="320px" className="object-cover object-top" />
            <button type="button" aria-label={`Remove ${label}`} onClick={() => remove.mutate()} className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={replace.isPending || replaceUrl.isPending || isUploading} className="flex cursor-pointer flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed">
              {replace.isPending || replaceUrl.isPending || isUploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
              {replace.isPending || replaceUrl.isPending || isUploading ? "Saving…" : "Click to upload file"}
            </button>
            <div className="flex w-full max-w-60 items-center gap-2">
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
                className="cursor-pointer rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          <button type="button" onClick={() => inputRef.current?.click()} className="cursor-pointer self-start text-xs font-medium text-primary-text hover:underline">
            Replace image
          </button>
        </>
      )}
    </div>
  );
}

export function StepMedia({ projectId, images }: { projectId: string | null; images: ProjectImage[] }) {
  if (!projectId) {
    return <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Save the Basic step first to unlock media uploads.</p>;
  }
  const desktop = images.find((i) => i.type === "DESKTOP");
  const mobile = images.find((i) => i.type === "MOBILE");

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Two full-page screenshots: one for desktop, one for mobile. Both are required to publish.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Slot projectId={projectId} image={desktop} type="DESKTOP" label="Desktop screenshot (required to publish)" aspect="aspect-[4/3]" />
        <Slot projectId={projectId} image={mobile} type="MOBILE" label="Mobile screenshot" aspect="aspect-[9/16]" />
      </div>
    </div>
  );
}
