import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StandaloneShell } from "@/components/layout/standalone-shell";
import { LoginForm } from "@/components/dashboard/login-form";
import { getActor } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const actor = await getActor();
  if (actor) redirect("/dashboard");

  return (
    <StandaloneShell>
      <Suspense>
        <LoginForm />
      </Suspense>
    </StandaloneShell>
  );
}
