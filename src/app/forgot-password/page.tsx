import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StandaloneShell } from "@/components/layout/standalone-shell";
import { ForgotPasswordForm } from "@/components/dashboard/forgot-password-form";
import { getActor } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const actor = await getActor();
  if (actor) redirect("/dashboard");

  return (
    <StandaloneShell>
      <ForgotPasswordForm />
    </StandaloneShell>
  );
}
