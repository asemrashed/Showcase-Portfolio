"use client";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck, Send } from "lucide-react";
import { requestPasswordResetSchema } from "@/lib/schemas/user";
import { requestPasswordResetAction } from "@/actions/auth";
import { unwrap } from "@/lib/api/action-result";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

type ForgotPasswordInput = z.infer<typeof requestPasswordResetSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(requestPasswordResetSchema), defaultValues: { email: "" } });

  const { mutateAsync } = useMutation({ mutationFn: async (data: ForgotPasswordInput) => unwrap(await requestPasswordResetAction(data)) });

  const onSubmit = handleSubmit(async (data) => {
    // Same success state whether or not the email exists — never let this page reveal that.
    await mutateAsync(data).catch(() => undefined);
    setSent(true);
  });

  if (sent) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-text">
            <MailCheck className="size-5" />
          </span>
          <h1 className="text-lg font-medium">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for that address, we've sent a link to reset your password. It expires in 1 hour.
          </p>
          <Link href="/login" className="mt-2 text-sm font-medium text-primary-text hover:underline">
            Back to sign in
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Forgot your password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-1">
            Send reset link
            <Send className="size-4" />
          </Button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
