"use server";
import { exec } from "@/lib/action";
import { idSchema, reorderSchema } from "@/lib/schemas/common";
import { heroSlideSchema, heroSlideUpdateSchema } from "@/lib/schemas/hero";
import * as svc from "@/lib/services/heroService";

export async function createHeroSlideAction(input: unknown) {
  return exec({ permission: "hero:manage", schema: heroSlideSchema, input }, (a, d) => svc.create(a, d));
}
export async function updateHeroSlideAction(id: string, input: unknown) {
  return exec({ permission: "hero:manage", schema: heroSlideUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteHeroSlideAction(id: string) {
  return exec({ permission: "hero:manage", schema: idSchema, input: id }, (a, d) => svc.remove(a, d));
}
export async function reorderHeroSlidesAction(input: unknown) {
  return exec({ permission: "hero:manage", schema: reorderSchema, input }, (a, d) => svc.reorder(a, d.items));
}
