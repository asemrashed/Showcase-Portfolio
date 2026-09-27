"use server";
import { exec } from "@/lib/action";
import { idSchema, reorderSchema } from "@/lib/schemas/common";
import { reviewSchema, reviewUpdateSchema } from "@/lib/schemas/review";
import * as svc from "@/lib/services/reviewService";

export async function createReviewAction(input: unknown) {
  return exec({ permission: "review:manage", schema: reviewSchema, input }, (a, d) => svc.create(a, d));
}
export async function updateReviewAction(id: string, input: unknown) {
  return exec({ permission: "review:manage", schema: reviewUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteReviewAction(id: string) {
  return exec({ permission: "review:manage", schema: idSchema, input: id }, (a, d) => svc.remove(a, d));
}
export async function reorderReviewsAction(input: unknown) {
  return exec({ permission: "review:manage", schema: reorderSchema, input }, (a, d) => svc.reorder(a, d.items));
}
