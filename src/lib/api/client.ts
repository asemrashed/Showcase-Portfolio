import type { ProjectsPage, CategoryData } from "@/types/api";

/** Mirrors the Phase 1 envelope: { ok: true, data } | { ok: false, error }. */
type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]>; retryAfter?: number } };

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string[]>,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Cannot reach the server. Check your connection and try again.", 0);
  }
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    /* non-JSON response */
  }
  if (!body) throw new ApiError("INTERNAL_ERROR", "Unexpected response from the server.", res.status);
  if (!body.ok) {
    const e = body.error;
    throw new ApiError(e.code, e.message, res.status, e.fieldErrors, e.retryAfter);
  }
  return body.data;
}

export type ProjectsParams = { category?: string; search?: string; featured?: boolean; page?: number; pageSize?: number };

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  projects: (p: ProjectsParams = {}) => request<ProjectsPage>(`/api/projects${qs(p)}`),
  categories: () => request<CategoryData[]>("/api/categories"),
  submitContact: (input: unknown) =>
    request<{ id?: string }>("/api/contact", { method: "POST", body: JSON.stringify(input) }),
};

/** Query keys + staleTime per resource (lists change rarely; server revalidates by tag). */
export const qk = {
  projects: (p: Omit<ProjectsParams, "page">) => ["projects", p] as const,
  categories: ["categories"] as const,
};
export const STALE = { projects: 60_000, categories: 5 * 60_000 } as const;
