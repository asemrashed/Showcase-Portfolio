"use server";
import { exec } from "@/lib/action";
import { idSchema, reorderSchema } from "@/lib/schemas/common";
import { technologySchema, technologyUpdateSchema } from "@/lib/schemas/technology";
import * as svc from "@/lib/services/technologyService";

export async function createTechnologyAction(input: unknown) {
  return exec({ permission: "technology:manage", schema: technologySchema, input }, (a, d) => svc.create(a, d));
}
export async function updateTechnologyAction(id: string, input: unknown) {
  return exec({ permission: "technology:manage", schema: technologyUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteTechnologyAction(id: string) {
  return exec({ permission: "technology:manage", schema: idSchema, input: id }, (a, d) => svc.remove(a, d));
}
export async function reorderTechnologiesAction(input: unknown) {
  return exec({ permission: "technology:manage", schema: reorderSchema, input }, (a, d) => svc.reorder(a, d.items));
}
