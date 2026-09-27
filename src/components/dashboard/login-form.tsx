"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { z } from "zod";
import { authLoginSchema } from "@/lib/schemas/user";
import { loginAction } from "@/actions/auth";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

type AuthLoginInput = z.infer<typeof authLoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthLoginInput>({ resolver: zodResolver(authLoginSchema), defaultValues: { email: "", password: "" } });

  const { mutateAsync } = useMutation({
    mutationFn: async (data: AuthLoginInput) => unwrap(await loginAction(data)),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
      toast.error("Couldn't sign in", { description: message });
    }
  });

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-semibold">Sign in to your dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Use the credentials your admin gave you.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          </FormField>
          <Link href="/forgot-password" className="-mt-3 self-end text-xs font-medium text-primary-text hover:underline">
            Forgot password?
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-1">
            Sign in
            <LogIn className="size-4" />
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
