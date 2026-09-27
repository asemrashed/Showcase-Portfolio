"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import type { DashboardAuditRow } from "@/types/dashboard";
import { formatRelative } from "@/lib/utils";

export default function AuditPage() {
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const params = { entity: entity || undefined, action: action || undefined, page, pageSize: 20 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dqk.audit(params), queryFn: () => dashboardApi.audit(params) });

  const columns: Column<DashboardAuditRow>[] = [
    { key: "date", header: "When", className: "whitespace-nowrap", render: (r) => formatRelative(r.createdAt) },
    { key: "actor", header: "Actor", render: (r) => r.actorEmail ?? "System" },
    { key: "action", header: "Action", render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.action}</code> },
    { key: "entity", header: "Entity", render: (r) => `${r.entity}${r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}` },
    {
      key: "meta",
      header: "Details",
      render: (r) => (r.meta ? <span className="line-clamp-1 text-xs text-muted-foreground">{JSON.stringify(r.meta)}</span> : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by entity (e.g. Project)"
          className="sm:max-w-52"
        />
        <Input
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by action (e.g. publish)"
          className="sm:max-w-52"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No activity recorded"
        page={data?.page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
