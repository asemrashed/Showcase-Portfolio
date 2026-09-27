import { ApiError } from "./client";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]>; retryAfter?: number } };

/** Server actions never throw — they return { ok, data | error }. Unwrap for TanStack Query's mutation flow. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data;
  const { code, message, fieldErrors, retryAfter } = result.error;
  throw new ApiError(code, message, 0, fieldErrors, retryAfter);
}
