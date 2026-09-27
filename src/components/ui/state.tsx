import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FolderOpen, TriangleAlert } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type StateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  /** Rules: error/not-found/dashboard-empty states always offer a way back home. */
  showHomeLink?: boolean;
  className?: string;
};

function StateShell({ icon: Icon, title, description, action, showHomeLink, className, tone }: StateProps & { tone: "empty" | "error" }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border px-6 py-16 text-center", className)}>
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          tone === "error" ? "bg-danger-soft text-danger" : "bg-muted text-muted-foreground",
        )}
      >
        {Icon ? <Icon className="size-5" aria-hidden /> : null}
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {action &&
          (action.href ? (
            <Button asChild size="sm" variant={tone === "error" ? "primary" : "secondary"}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button size="sm" variant={tone === "error" ? "primary" : "secondary"} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        {showHomeLink && (
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StateShell tone="empty" icon={FolderOpen} {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StateShell tone="error" icon={TriangleAlert} {...props} />;
}
