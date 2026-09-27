"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { GripVertical, ImagePlus, Loader2, X } from "lucide-react";
import { useImageUpload, type UploadFolder } from "@/hooks/use-image-upload";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MultiImageItem = { url: string; key: string; alt: string };

export function MultiImageUploader<T extends MultiImageItem>({
  items,
  onChange,
  folder,
  makeItem,
  renderExtra,
  max = 40,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  folder: UploadFolder;
  /** Turns a freshly-uploaded asset into a full item (e.g. attaches a default `device`). */
  makeItem: (asset: { url: string; key: string; alt: string }) => T;
  renderExtra?: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const { upload, isUploading } = useImageUpload(folder);
  const { handlers, dragIndex, overIndex } = useDragReorder(items, onChange);

  const addFiles = async (files: FileList) => {
    const room = max - items.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    for (const file of list) {
      try {
        const asset = await upload(file);
        onChange([...items, makeItem({ ...asset, alt: file.name || "Uploaded image" })]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      if (items.length >= max) return;
      onChange([...items, makeItem({ url: urlInput.trim(), key: urlInput.trim(), alt: "External image" })]);
      setUrlInput("");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  const update = (index: number, patch: Partial<T>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={item.key}
          {...handlers(i)}
          className={cn(
            "flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3 transition-colors",
            dragIndex === i && "opacity-50",
            overIndex === i && dragIndex !== i && "border-primary",
          )}
        >
          <span className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden>
            <GripVertical className="size-4" />
          </span>
          <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
            <Image src={item.url} alt={item.alt || ""} fill sizes="96px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Input
              value={item.alt}
              onChange={(e) => update(i, { alt: e.target.value } as Partial<T>)}
              placeholder="Alt text (required)"
              aria-label="Image alt text"
            />
            {renderExtra?.(item, (patch) => update(i, patch))}
          </div>
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => remove(i)}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {items.length < max && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {isUploading ? "Uploading…" : "Upload images"}
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border p-3">
             <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL here..."
                className="h-9 text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
    </div>
  );
}
