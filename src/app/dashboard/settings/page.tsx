"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/schemas/content";
import { updateSettingsAction } from "@/actions/singletons";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { SocialsField } from "@/components/ui/socials-field";
import { ImageUploader } from "@/components/dashboard/image-uploader";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings, isLoading, isError, refetch } = useQuery({ queryKey: dqk.settings, queryFn: dashboardApi.settings });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SiteSettingsInput>({ resolver: formResolver<SiteSettingsInput>(siteSettingsSchema), defaultValues: { socials: [] } });

  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.siteName,
        tagline: settings.tagline ?? "",
        currency: settings.currency,
        footerText: settings.footerText ?? "",
        contactNotifyEmail: settings.contactNotifyEmail ?? "",
        logo: settings.logoUrl ? { url: settings.logoUrl, key: settings.logoKey! } : null,
        socials: settings.socials as { platform: string; url: string }[],
      });
    }
  }, [settings, reset]);

  const logo = watch("logo") as { url: string; key: string } | null | undefined;

  const mutation = useMutation({
    mutationFn: async (data: SiteSettingsInput) => unwrap(await updateSettingsAction(data)),
    onSuccess: () => {
      toast.success("Settings updated");
      qc.invalidateQueries({ queryKey: dqk.settings });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't save changes"),
  });

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (isError) return <ErrorState title="Couldn't load settings" action={{ label: "Try again", onClick: () => refetch() }} />;

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="flex flex-col gap-5">
        <FormField label="Logo" htmlFor="settings-logo" optional>
          <ImageUploader
            value={logo ? { ...logo, alt: "" } : null}
            onChange={(v) => setValue("logo", v ? { url: v.url, key: v.key } : null, { shouldDirty: true })}
            folder="settings"
            aspect="aspect-square max-w-32"
            altRequired={false}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Site name" htmlFor="settings-name" error={errors.siteName?.message}>
            <Input id="settings-name" aria-invalid={!!errors.siteName} {...register("siteName")} />
          </FormField>
          <FormField label="Currency" htmlFor="settings-currency" error={errors.currency?.message}>
            <Input id="settings-currency" placeholder="USD" {...register("currency")} />
          </FormField>
        </div>
        <FormField label="Tagline" htmlFor="settings-tagline" error={errors.tagline?.message} optional>
          <Input id="settings-tagline" {...register("tagline")} />
        </FormField>
        <FormField label="Footer text" htmlFor="settings-footer" error={errors.footerText?.message} optional>
          <Textarea id="settings-footer" rows={2} {...register("footerText")} />
        </FormField>
        <FormField label="Contact notification email" htmlFor="settings-notify" error={errors.contactNotifyEmail?.message} optional>
          <Input id="settings-notify" type="email" placeholder="Receives a copy of every contact form submission" {...register("contactNotifyEmail")} />
        </FormField>
        <div>
          <span className="text-sm font-medium">Social links</span>
          <div className="mt-2">
            <SocialsField control={control} register={register} name="socials" />
          </div>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty} className="mt-1 self-start">
          <Save className="size-4" />
          Save changes
        </Button>
      </form>
    </Card>
  );
}
