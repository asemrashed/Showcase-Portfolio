import type { Metadata } from "next";
import { Suspense } from "react";
import { StandaloneShell } from "@/components/layout/standalone-shell";
import { ResetPasswordForm } from "@/components/dashboard/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <StandaloneShell>
      <Suspense>
        <ResetPasswordForm token={token ?? null} />
      </Suspense>
    </StandaloneShell>
  );
}
