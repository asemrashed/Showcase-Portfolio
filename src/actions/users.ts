"use server";
import { exec, NoInput } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { userCreateSchema, userUpdateSchema } from "@/lib/schemas/user";
import * as svc from "@/lib/services/userService";

export async function createUserAction(input: unknown) {
  return exec({ permission: "user:manage", schema: userCreateSchema, input }, (a, d) => svc.create(a, d));
}
export async function updateUserAction(id: string, input: unknown) {
  return exec({ permission: "user:manage", schema: userUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteUserAction(id: string) {
  return exec({ permission: "user:manage", schema: NoInput, input: undefined }, (a) => svc.remove(a, idSchema.parse(id)));
}
