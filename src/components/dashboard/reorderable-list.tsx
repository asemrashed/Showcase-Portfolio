"use client";
import { GripVertical } from "lucide-react";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { cn } from "@/lib/utils";

export function ReorderableList<T>({
  items,
  rowKey,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  rowKey: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}) {
  const { handlers, dragIndex, overIndex } = useDragReorder(items, onReorder);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => (
        <div
          key={rowKey(item)}
          {...handlers(i)}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-3 transition-colors",
            dragIndex === i && "opacity-50",
            overIndex === i && dragIndex !== i && "border-primary",
          )}
        >
          <span className="cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden title="Drag to reorder">
            <GripVertical className="size-4" />
          </span>
          <div className="min-w-0 flex-1">{renderItem(item)}</div>
        </div>
      ))}
    </div>
  );
}
