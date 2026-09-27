"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { z } from "zod";
import { changePasswordSchema } from "@/lib/schemas/user";
import { changePasswordAction } from "@/actions/auth";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export default function AccountPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "" } });

  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordInput) => unwrap(await changePasswordAction(data)),
    onSuccess: () => {
      toast.success("Password updated");
      reset();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't update password"),
  });

  return (
    <Card className="max-w-md">
      <CardBody>
        <h2 className="text-base font-medium">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use at least 10 characters with a letter and a number.</p>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="mt-5 flex flex-col gap-5">
          <FormField label="Current password" htmlFor="acc-current" error={errors.currentPassword?.message}>
            <Input id="acc-current" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
          </FormField>
          <FormField label="New password" htmlFor="acc-new" error={errors.newPassword?.message}>
            <Input id="acc-new" type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </FormField>
          <Button type="submit" loading={isSubmitting} className="self-start">
            <KeyRound className="size-4" />
            Update password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
