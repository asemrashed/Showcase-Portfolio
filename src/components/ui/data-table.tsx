"use client";
import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./skeleton";
import { EmptyState, ErrorState } from "./state";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  rowClassName?: (row: T) => string | undefined;
};

/** Rows are memoized (Rules: React.memo on list/table rows). Page-based pagination keeps
 *  each render ≤ pageSize rows, so no separate virtualization is needed for admin-sized lists. */
const Row = memo(function Row<T>({ row, columns, className }: { row: T; columns: Column<T>[]; className?: string }) {
  return (
    <tr className={cn("border-b border-border last:border-0 hover:bg-muted/60", className)}>
      {columns.map((col) => (
        <td key={col.key} className={cn("px-4 py-3.5 align-middle text-sm", col.className)}>
          {col.render(row)}
        </td>
      ))}
    </tr>
  );
}) as <T>(props: { row: T; columns: Column<T>[]; className?: string }) => React.ReactElement;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  page,
  totalPages,
  onPageChange,
  rowClassName,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div className="overflow-x-auto thin-scroll">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3 text-xs font-medium text-muted-foreground", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full max-w-40" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <Row key={rowKey(row)} row={row} columns={columns} className={rowClassName?.(row)} />
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && isError && (
        <div className="p-4">
          <ErrorState title="Couldn't load data" description={errorMessage} action={onRetry ? { label: "Try again", onClick: onRetry } : undefined} />
        </div>
      )}
      {!isLoading && !isError && rows.length === 0 && (
        <div className="p-4">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && page !== undefined && totalPages !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
