"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { userCreateSchema, userUpdateSchema, passwordSchema } from "@/lib/schemas/user";
import { createUserAction, updateUserAction, deleteUserAction } from "@/actions/users";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import type { DashboardUser } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Select, Switch } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRelative, initials } from "@/lib/utils";

const ROLE_LABEL: Record<UserRole, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Admin", DEVELOPER: "Developer" };

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardUser | null>(null);
  const [deleting, setDeleting] = useState<DashboardUser | null>(null);

  const params = { search: debouncedSearch || undefined, page, pageSize: 15 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dqk.users(params), queryFn: () => dashboardApi.users(params) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["dashboard", "users"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteUserAction(id)),
    onSuccess: () => {
      toast.success("User removed");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't remove user"),
  });

  const columns: Column<DashboardUser>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-medium text-primary-text">{initials(u.name || u.email)}</span>
          <div className="min-w-0">
            <p className="truncate font-medium">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (u) => <Badge>{ROLE_LABEL[u.role]}</Badge> },
    { key: "active", header: "Status", render: (u) => (u.active ? <Badge className="text-emerald-700 dark:text-emerald-400">Active</Badge> : <Badge>Disabled</Badge>) },
    { key: "lastLogin", header: "Last login", render: (u) => <span className="text-muted-foreground">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : "Never"}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${u.name}`}
            onClick={() => {
              setEditing(u);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Remove ${u.name}`} onClick={() => setDeleting(u)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search users…"
          className="w-full max-w-xs rounded-[var(--radius-md)] border border-input bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New user
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No users found"
        page={data?.page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />

      {formOpen && (
        <UserFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          user={editing}
          onSaved={() => {
            invalidate();
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove "${deleting?.name}"?`}
        description="They'll lose dashboard access immediately."
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}

const editUserSchema = userUpdateSchema.extend({
  password: z.union([passwordSchema, z.literal("")]).optional(),
});
type UserFormInput = z.infer<typeof userCreateSchema> | z.infer<typeof editUserSchema>;

function UserFormModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DashboardUser | null;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInput>({
    resolver: zodResolver(user ? editUserSchema : userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "DEVELOPER",
      active: user?.active ?? true,
    },
  });
  const active = watch("active");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = { ...data };
      if (user && !payload.password) delete (payload as { password?: string }).password;
      const result = user ? await updateUserAction(user.id, payload) : await createUserAction(payload);
      unwrap(result);
      toast.success(user ? "User updated" : "User created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Something went wrong");
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={user ? "Edit user" : "New user"} size="md">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Name" htmlFor="user-name" error={errors.name?.message}>
          <Input id="user-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="user-email" error={errors.email?.message}>
          <Input id="user-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="user-password" error={errors.password?.message} optional={!!user}>
          <Input id="user-password" type="password" placeholder={user ? "Leave blank to keep current" : undefined} aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
        <FormField label="Role" htmlFor="user-role" error={errors.role?.message}>
          <Select id="user-role" {...register("role")}>
            <option value="DEVELOPER">Developer</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
        </FormField>
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3.5">
          <span className="text-sm font-medium">Active</span>
          <Switch checked={active ?? true} onCheckedChange={(v) => setValue("active", v)} label="User active" />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {user ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
