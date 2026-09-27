"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { contactInfoSchema, type ContactInfoInput } from "@/lib/schemas/content";
import { updateContactInfoAction } from "@/actions/singletons";
import { dashboardApi, dqk } from "@/lib/api/dashboard";
import { unwrap } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { SocialsField } from "@/components/ui/socials-field";

export default function ContactInfoPage() {
  const qc = useQueryClient();
  const { data: info, isLoading, isError, refetch } = useQuery({ queryKey: dqk.contactInfo, queryFn: dashboardApi.contactInfo });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactInfoInput>({ resolver: formResolver<ContactInfoInput>(contactInfoSchema), defaultValues: { socials: [] } });

  useEffect(() => {
    if (info) {
      reset({
        email: info.email ?? "",
        phone: info.phone ?? "",
        address: info.address ?? "",
        mapUrl: info.mapUrl ?? "",
        workingHours: info.workingHours ?? "",
        socials: info.socials as { platform: string; url: string }[],
      });
    }
  }, [info, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ContactInfoInput) => unwrap(await updateContactInfoAction(data)),
    onSuccess: () => {
      toast.success("Contact info updated");
      qc.invalidateQueries({ queryKey: dqk.contactInfo });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Couldn't save changes"),
  });

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (isError) return <ErrorState title="Couldn't load contact info" action={{ label: "Try again", onClick: () => refetch() }} />;

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Email" htmlFor="ci-email" error={errors.email?.message} optional>
            <Input id="ci-email" type="email" {...register("email")} />
          </FormField>
          <FormField label="Phone" htmlFor="ci-phone" error={errors.phone?.message} optional>
            <Input id="ci-phone" {...register("phone")} />
          </FormField>
        </div>
        <FormField label="Address" htmlFor="ci-address" error={errors.address?.message} optional>
          <Textarea id="ci-address" rows={2} {...register("address")} />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Map URL" htmlFor="ci-map" error={errors.mapUrl?.message} optional>
            <Input id="ci-map" placeholder="https://maps.google.com/…" {...register("mapUrl")} />
          </FormField>
          <FormField label="Working hours" htmlFor="ci-hours" error={errors.workingHours?.message} optional>
            <Input id="ci-hours" placeholder="Mon–Fri, 9am–6pm" {...register("workingHours")} />
          </FormField>
        </div>
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
