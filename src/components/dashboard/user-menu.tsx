"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { initials } from "@/lib/utils";

export function UserMenu({ name, email, role }: { name: string | null; email: string; role: string }) {
  const router = useRouter();
  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
    onError: () => toast.error("Couldn't sign out. Please try again."),
  });

  const displayName = name || email;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2.5 rounded-[var(--radius-md)] py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-muted focus-visible:outline-none">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-medium text-primary-text">
          {initials(displayName)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{displayName}</span>
          <span className="block text-xs capitalize leading-tight text-muted-foreground">{role.replace("_", " ").toLowerCase()}</span>
        </span>
        <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-52 rounded-[var(--radius-lg)] border border-border bg-surface p-1.5 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link href="/dashboard/account" className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted">
              <UserCircle className="size-4" />
              Account
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
          <DropdownMenu.Item
            disabled={isPending}
            onSelect={() => logout()}
            className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-danger outline-none transition-colors hover:bg-danger-soft focus:bg-danger-soft data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
