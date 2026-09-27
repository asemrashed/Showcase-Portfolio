import type { ProjectStatus, MessageStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const PROJECT_TONE: Record<ProjectStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};
const MESSAGE_TONE: Record<MessageStatus, string> = {
  NEW: "bg-primary-soft text-primary-text",
  READ: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: ProjectStatus | MessageStatus }) {
  const tone = status in PROJECT_TONE ? PROJECT_TONE[status as ProjectStatus] : MESSAGE_TONE[status as MessageStatus];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize", tone)}>
      {status.toLowerCase()}
    </span>
  );
}
