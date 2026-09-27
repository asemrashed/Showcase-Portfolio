"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/schemas/message";
import { api, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: ContactMessageInput) => api.submitContact(data),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      toast.success("Message sent", { description: "Thanks for reaching out — we'll reply within a couple of business days." });
      reset();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
      toast.error("Couldn't send your message", { description: message });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot — real visitors never see or fill this in. */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
      </div>

      <FormField label="Subject" htmlFor="subject" error={errors.subject?.message} optional>
        <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
      </FormField>

      <FormField label="Message" htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={6} aria-invalid={!!errors.message} {...register("message")} />
      </FormField>

      <Button type="submit" size="lg" loading={isSubmitting} className="self-start">
        Send message
        <Send className="size-4" />
      </Button>
    </form>
  );
}
