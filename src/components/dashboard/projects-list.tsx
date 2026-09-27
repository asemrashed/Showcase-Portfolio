"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { ProjectStatus, UserRole } from "@prisma/client";
import { Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { deleteProjectAction } from "@/actions/projects";
import { unwrap } from "@/lib/api/action-result";
import { toast } from "sonner";
import type { DashboardProjectRow } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRelative } from "@/lib/utils";

export function ProjectsList({ role }: { role?: UserRole }) {
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = { status: status || undefined, search: debouncedSearch || undefined, page, pageSize: 15 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dqk.projects(params), queryFn: () => dashboardApi.projects(params) });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteProjectAction(id)),
    onSuccess: () => {
      toast.success("Project deleted");
      setDeleteId(null);
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't delete project"),
  });

  const columns: Column<DashboardProjectRow>[] = [
    {
      key: "name",
      header: "Project",
      render: (p) => (
        <Link href={`/dashboard/projects/${p.id}/edit`} className="font-medium hover:text-primary-text">
          {p.name}
        </Link>
      ),
    },
    { key: "category", header: "Category", render: (p) => p.category.name },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "owner", header: "Owner", render: (p) => p.createdBy?.name ?? "—" },
    { key: "featured", header: "Featured", render: (p) => (p.featured ? "Yes" : "—") },
    { key: "updated", header: "Updated", render: (p) => <span className="text-muted-foreground">{formatRelative(p.updatedAt)}</span> },
  ];

  if (isAdmin) {
    columns.push({
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {p.status === "PENDING" && (
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/80">
              <Link href={`/dashboard/projects/${p.id}/edit`} title="Accept (Publish)">
                <CheckCircle className="size-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link href={`/dashboard/projects/${p.id}/edit`} title="Edit">
              <Edit2 className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-danger hover:text-danger/80" onClick={() => setDeleteId(p.id)} title="Delete">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects…"
            className="w-full rounded-[var(--radius-md)] border border-input bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 sm:max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProjectStatus | "");
              setPage(1);
            }}
            className="sm:w-44"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to get it in front of visitors."
        page={data?.page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this project?"
        description="This can't be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
