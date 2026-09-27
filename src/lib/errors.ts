export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INVALID_TRANSITION"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export const STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  INVALID_TRANSITION: 409,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public fieldErrors?: Record<string, string[]>,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const unauthorized = (m = "Authentication required") => new AppError("UNAUTHORIZED", m);
export const forbidden = (m = "You do not have permission to do this") => new AppError("FORBIDDEN", m);
export const notFound = (m = "Not found") => new AppError("NOT_FOUND", m);
export const conflict = (m: string) => new AppError("CONFLICT", m);
export const badRequest = (m: string) => new AppError("BAD_REQUEST", m);
export const validation = (m: string, fieldErrors?: Record<string, string[]>) =>
  new AppError("VALIDATION_ERROR", m, fieldErrors);
export const rateLimited = (retryAfter: number) =>
  new AppError("RATE_LIMITED", "Too many requests. Please try again later.", undefined, retryAfter);
