import { Badge } from "@/components/ui/badge";

/**
 * A technology's `icon` can be a logo image URL (uploaded, or pasted from anywhere on the web)
 * or a legacy lucide-react icon name. We only know how to render the former, so anything that
 * doesn't look like a URL falls back to name-only — a plain <img> (not next/image) since these
 * can come from arbitrary external hosts.
 */
export function TechBadge({ name, icon, className }: { name: string; icon?: string | null; className?: string }) {
  const isImage = !!icon && /^https?:\/\//i.test(icon);
  return (
    <Badge className={className}>
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={14} height={14} className="size-3.5 shrink-0 rounded-sm object-contain" loading="lazy" />
      )}
      {name}
    </Badge>
  );
}
