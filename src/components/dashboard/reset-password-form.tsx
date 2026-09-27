"use client";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { resetPasswordSchema } from "@/lib/schemas/user";
import { resetPasswordAction } from "@/actions/auth";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/state";

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token: token ?? "", newPassword: "" } });

  const { mutateAsync, error } = useMutation({ mutationFn: async (data: ResetPasswordInput) => unwrap(await resetPasswordAction(data)) });

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
    setDone(true);
  });

  if (!token) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="Invalid reset link"
            description="This link is missing its token. Request a new one from the forgot-password page."
            action={{ label: "Request a new link", href: "/forgot-password" }}
          />
        </CardBody>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-text">
            <CheckCircle2 className="size-5" />
          </span>
          <h1 className="text-lg font-medium">Password updated</h1>
          <p className="text-sm text-muted-foreground">You're signed out everywhere else. Sign in with your new password.</p>
          <Button className="mt-2" onClick={() => router.push("/login")}>
            Go to sign in
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Use at least 10 characters with a letter and a number.</p>
        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <input type="hidden" {...register("token")} />
          <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message ?? (error instanceof ApiError ? error.message : undefined)}>
            <Input id="newPassword" type="password" autoComplete="new-password" autoFocus aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </FormField>
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-1">
            <KeyRound className="size-4" />
            Reset password
          </Button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
