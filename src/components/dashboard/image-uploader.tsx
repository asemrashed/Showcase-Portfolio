"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useImageUpload, type UploadFolder } from "@/hooks/use-image-upload";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ImageRefValue = { url: string; key: string; alt: string } | null;

export function ImageUploader({
  value,
  onChange,
  folder,
  altRequired = true,
  aspect = "aspect-[4/3]",
  className,
}: {
  value: ImageRefValue;
  onChange: (value: ImageRefValue) => void;
  folder: UploadFolder;
  altRequired?: boolean;
  aspect?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const { upload, isUploading } = useImageUpload(folder);

  const handleFile = async (file: File) => {
    try {
      const asset = await upload(file);
      onChange({ ...asset, alt: value?.alt || file.name || "Uploaded image" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      onChange({ url: urlInput.trim(), key: urlInput.trim(), alt: value?.alt || "External image" });
      setUrlInput("");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border bg-muted",
          aspect,
        )}
      >
        {value ? (
          <>
            <Image src={value.url} alt={value.alt || ""} fill sizes="320px" className="object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
              {isUploading ? "Uploading…" : "Click to upload file"}
            </button>
            <div className="flex w-full max-w-[240px] items-center gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste URL here..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {value && (
        <Input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder={altRequired ? "Alt text (required)" : "Alt text"}
          aria-label="Image alt text"
        />
      )}
      {value && (
        <button type="button" onClick={() => inputRef.current?.click()} className="self-start text-xs font-medium text-primary-text hover:underline">
          Replace image
        </button>
      )}
    </div>
  );
}
