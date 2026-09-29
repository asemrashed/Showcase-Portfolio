"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Input } from "@/components/ui/input";

export type IconValue = { icon: string; iconKey: string | null };

/**
 * Technology icon field. URL is the default, primary way to set it — paste a link to the
 * brand's logo (or a lucide-react icon name for the older style) straight into the text field.
 * "Upload a logo file" is the alternative underneath, for when you have the image but not a link.
 */
export function IconField({ value, onChange }: { value: IconValue; onChange: (v: IconValue) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload("technologies");
  const [urlDraft, setUrlDraft] = useState(value.icon);

  const looksLikeImage = /^https?:\/\//i.test(value.icon);

  const commitUrl = (raw: string) => {
    const trimmed = raw.trim();
    // Typed/pasted by hand: no longer "our" upload, so drop any stale iconKey.
    onChange({ icon: trimmed, iconKey: trimmed === value.icon ? value.iconKey : null });
  };

  const handleFile = async (file: File) => {
    try {
      const asset = await upload(file);
      setUrlDraft(asset.url);
      onChange({ icon: asset.url, iconKey: asset.key });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
          {looksLikeImage ? (
            <Image src={value.icon} alt="" width={40} height={40} className="size-full object-contain p-1" unoptimized />
          ) : (
            <ImagePlus className="size-4 text-muted-foreground" />
          )}
        </div>
        <Input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onBlur={(e) => commitUrl(e.target.value)}
          placeholder="https://... logo URL (or a lucide-react icon name)"
          className="flex-1"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-primary-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
        {isUploading ? "Uploading…" : "Upload a logo file instead"}
      </button>
      {value.iconKey && (
        <button
          type="button"
          onClick={() => {
            setUrlDraft("");
            onChange({ icon: "", iconKey: null });
          }}
          className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Remove uploaded logo
        </button>
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
  );
}
