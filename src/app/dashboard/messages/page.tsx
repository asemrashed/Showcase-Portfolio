"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen } from "lucide-react";
import type { MessageStatus } from "@prisma/client";
import { updateMessageStatusAction, deleteMessageAction } from "@/actions/messages";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardMessage } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRelative, cn } from "@/lib/utils";

export default function MessagesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<MessageStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [viewing, setViewing] = useState<DashboardMessage | null>(null);
  const [deleting, setDeleting] = useState<DashboardMessage | null>(null);

  const params = { status: status || undefined, search: debouncedSearch || undefined, page, pageSize: 15 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dqk.messages(params), queryFn: () => dashboardApi.messages(params) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["dashboard", "messages"] });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MessageStatus }) => unwrap(await updateMessageStatusAction(id, { status })),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't update message"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteMessageAction(id)),
    onSuccess: () => {
      toast.success("Message deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't delete message"),
  });

  const openMessage = (m: DashboardMessage) => {
    setViewing(m);
    if (m.status === "NEW") statusMutation.mutate({ id: m.id, status: "READ" });
  };

  const columns: Column<DashboardMessage>[] = [
    {
      key: "from",
      header: "From",
      render: (m) => (
        <button onClick={() => openMessage(m)} className="text-left hover:text-primary-text">
          <p className="font-medium">{m.name}</p>
          <p className="text-xs text-muted-foreground">{m.email}</p>
        </button>
      ),
    },
    { key: "subject", header: "Subject", render: (m) => <span className="line-clamp-1">{m.subject || "—"}</span> },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
    { key: "date", header: "Received", render: (m) => <span className="text-muted-foreground">{formatRelative(m.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={m.status === "NEW" ? "Mark as read" : "Mark as new"}
            onClick={() => statusMutation.mutate({ id: m.id, status: m.status === "NEW" ? "READ" : "NEW" })}
          >
            {m.status === "NEW" ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete message" onClick={() => setDeleting(m)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search messages…"
          className="w-full rounded-[var(--radius-md)] border border-input bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as MessageStatus | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No messages"
        emptyDescription="Contact form submissions will show up here."
        page={data?.page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        rowClassName={(m) => cn(m.status === "NEW" && "bg-primary-soft/30")}
      />

      {viewing && (
        <Modal open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} title={viewing.subject || "Message"} description={`From ${viewing.name} · ${viewing.email}`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{viewing.message}</p>
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => statusMutation.mutate({ id: viewing.id, status: "ARCHIVED" })}>
              Archive
            </Button>
            <Button asChild size="sm">
              <a href={`mailto:${viewing.email}`}>Reply by email</a>
            </Button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this message?"
        description="This can't be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}
