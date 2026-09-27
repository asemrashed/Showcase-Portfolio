"use server";
import { exec } from "@/lib/action";
import { idSchema, reorderSchema } from "@/lib/schemas/common";
import { categorySchema, categoryUpdateSchema } from "@/lib/schemas/category";
import * as svc from "@/lib/services/categoryService";

export async function createCategoryAction(input: unknown) {
  return exec({ permission: "category:manage", schema: categorySchema, input }, (a, d) => svc.create(a, d));
}
export async function updateCategoryAction(id: string, input: unknown) {
  return exec({ permission: "category:manage", schema: categoryUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteCategoryAction(id: string) {
  return exec({ permission: "category:manage", schema: idSchema, input: id }, (a, d) => svc.remove(a, d));
}
export async function reorderCategorysAction(input: unknown) {
  return exec({ permission: "category:manage", schema: reorderSchema, input }, (a, d) => svc.reorder(a, d.items));
}
