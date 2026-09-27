"use server";
import { headers } from "next/headers";
import { exec, NoInput, run } from "@/lib/action";
import { clientIp } from "@/lib/rate-limit";
import { authLoginSchema, changePasswordSchema, requestPasswordResetSchema, resetPasswordSchema } from "@/lib/schemas/user";
import * as authService from "@/lib/services/authService";
import * as userService from "@/lib/services/userService";

export async function loginAction(input: unknown) {
  return run(async () => {
    const data = authLoginSchema.parse(input);
    return authService.login(data, clientIp(await headers()));
  });
}

export async function logoutAction() {
  return run(() => authService.logout());
}

export async function changePasswordAction(input: unknown) {
  return exec({ schema: changePasswordSchema, input }, (actor, data) => userService.changeOwnPassword(actor, data));
}

export async function requestPasswordResetAction(input: unknown) {
  return run(async () => {
    const data = requestPasswordResetSchema.parse(input);
    return authService.requestPasswordReset(data.email, clientIp(await headers()));
  });
}

export async function resetPasswordAction(input: unknown) {
  return run(async () => {
    const data = resetPasswordSchema.parse(input);
    return authService.resetPassword(data.token, data.newPassword);
  });
}

export async function getMeAction() {
  return exec({ schema: NoInput, input: undefined }, async (actor) => actor);
}
