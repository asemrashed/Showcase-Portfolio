"use server";
import { exec, NoInput } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import {
  projectCreateSchema,
  projectImageCreateSchema,
  projectImageReorderSchema,
  projectPublishSchema,
  projectRejectSchema,
  projectUpdateSchema,
} from "@/lib/schemas/project";
import * as svc from "@/lib/services/projectService";

export async function createProjectAction(input: unknown) {
  return exec({ permission: "project:create", schema: projectCreateSchema, input }, (a, d) => svc.create(a, d));
}
export async function updateProjectAction(id: string, input: unknown) {
  return exec({ schema: projectUpdateSchema, input }, (a, d) => svc.update(a, idSchema.parse(id), d));
}
export async function deleteProjectAction(id: string) {
  return exec({ schema: NoInput, input: undefined }, (a) => svc.remove(a, idSchema.parse(id)));
}
export async function submitProjectAction(id: string) {
  return exec({ schema: NoInput, input: undefined }, (a) => svc.submit(a, idSchema.parse(id)));
}
export async function publishProjectAction(id: string, input: unknown) {
  return exec({ permission: "project:publish", schema: projectPublishSchema, input }, (a, d) =>
    svc.publish(a, idSchema.parse(id), d),
  );
}
export async function rejectProjectAction(id: string, input: unknown) {
  return exec({ permission: "project:reject", schema: projectRejectSchema, input }, (a, d) =>
    svc.reject(a, idSchema.parse(id), d.note),
  );
}
export async function archiveProjectAction(id: string) {
  return exec({ permission: "project:archive", schema: NoInput, input: undefined }, (a) =>
    svc.archive(a, idSchema.parse(id)),
  );
}
export async function restoreProjectAction(id: string) {
  return exec({ permission: "project:archive", schema: NoInput, input: undefined }, (a) =>
    svc.restore(a, idSchema.parse(id)),
  );
}
export async function addProjectImageAction(id: string, input: unknown) {
  return exec({ schema: projectImageCreateSchema, input }, (a, d) => svc.addImage(a, idSchema.parse(id), d));
}
export async function removeProjectImageAction(id: string, imageId: string) {
  return exec({ schema: NoInput, input: undefined }, (a) =>
    svc.removeImage(a, idSchema.parse(id), idSchema.parse(imageId)),
  );
}
export async function reorderProjectImagesAction(id: string, input: unknown) {
  return exec({ schema: projectImageReorderSchema, input }, (a, d) => svc.reorderImages(a, idSchema.parse(id), d.items));
}
