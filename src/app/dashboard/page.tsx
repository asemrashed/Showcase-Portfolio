"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, FileClock, Inbox, Users } from "lucide-react";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRelative } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dqk.overview, queryFn: dashboardApi.overview });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState title="Couldn't load your overview" action={{ label: "Try again", onClick: () => refetch() }} />;
  }

  const { stats, recentProjects, recentMessages, recentActivity } = data;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total projects" value={stats.totalProjects} icon={FolderKanban} />
        <StatCard label="Pending review" value={stats.projects.PENDING} icon={FileClock} tone={stats.projects.PENDING > 0 ? "warning" : "default"} />
        {stats.newMessages !== null && <StatCard label="New messages" value={stats.newMessages} icon={Inbox} tone={stats.newMessages > 0 ? "warning" : "default"} />}
        {stats.users !== null && <StatCard label="Users" value={stats.users} icon={Users} />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent projects</h2>
            <Link href="/dashboard/projects" className="text-xs font-medium text-primary-text hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {recentProjects.length === 0 ? (
              <EmptyState title="No projects yet" action={{ label: "New project", href: "/dashboard/projects/new" }} />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recentProjects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/dashboard/projects/${p.id}/edit`} className="min-w-0 truncate text-sm font-medium hover:text-primary-text">
                      {p.name}
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-muted-foreground">{formatRelative(p.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {recentMessages.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Recent messages</h2>
              <Link href="/dashboard/messages" className="text-xs font-medium text-primary-text hover:underline">
                View all
              </Link>
            </div>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.subject || "No subject"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={m.status} />
                    <span className="text-xs text-muted-foreground">{formatRelative(m.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{a.actorEmail ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="text-muted-foreground">· {a.entity}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
