import { request } from "./client";
import type {
  DashboardProjectsPage,
  DashboardProjectFull,
  DashboardCategory,
  DashboardHeroSlide,
  DashboardReview,
  DashboardUsersPage,
  DashboardUser,
  DashboardMessagesPage,
  DashboardMessageFull,
  DashboardOverview,
  DashboardAuditPage,
  DashboardAbout,
  DashboardContactInfo,
  DashboardSettings,
} from "@/types/dashboard";
import type { UserRole, ProjectStatus, MessageStatus } from "@prisma/client";

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type DashboardProjectsParams = { status?: ProjectStatus; search?: string; categoryId?: string; mine?: boolean; page?: number; pageSize?: number };
export type DashboardUsersParams = { search?: string; role?: UserRole; page?: number; pageSize?: number };
export type DashboardMessagesParams = { status?: MessageStatus; search?: string; page?: number; pageSize?: number };
export type DashboardAuditParams = { entity?: string; action?: string; actorId?: string; page?: number; pageSize?: number };

export const dashboardApi = {
  overview: () => request<DashboardOverview>("/api/dashboard/overview"),

  projects: (p: DashboardProjectsParams = {}) => request<DashboardProjectsPage>(`/api/dashboard/projects${qs(p)}`),
  project: (id: string) => request<DashboardProjectFull>(`/api/dashboard/projects/${id}`),

  categories: () => request<DashboardCategory[]>("/api/dashboard/categories"),
  category: (id: string) => request<DashboardCategory>(`/api/dashboard/categories/${id}`),

  heroSlides: () => request<DashboardHeroSlide[]>("/api/dashboard/hero"),

  reviews: () => request<DashboardReview[]>("/api/dashboard/reviews"),

  users: (p: DashboardUsersParams = {}) => request<DashboardUsersPage>(`/api/dashboard/users${qs(p)}`),
  user: (id: string) => request<DashboardUser>(`/api/dashboard/users/${id}`),

  messages: (p: DashboardMessagesParams = {}) => request<DashboardMessagesPage>(`/api/dashboard/messages${qs(p)}`),
  message: (id: string) => request<DashboardMessageFull>(`/api/dashboard/messages/${id}`),

  audit: (p: DashboardAuditParams = {}) => request<DashboardAuditPage>(`/api/dashboard/audit${qs(p)}`),

  about: () => request<DashboardAbout>("/api/dashboard/about"),
  contactInfo: () => request<DashboardContactInfo>("/api/dashboard/contact-info"),
  settings: () => request<DashboardSettings>("/api/dashboard/settings"),
};

export const dqk = {
  overview: ["dashboard", "overview"] as const,
  projects: (p: DashboardProjectsParams) => ["dashboard", "projects", p] as const,
  project: (id: string) => ["dashboard", "projects", id] as const,
  categories: ["dashboard", "categories"] as const,
  hero: ["dashboard", "hero"] as const,
  reviews: ["dashboard", "reviews"] as const,
  users: (p: DashboardUsersParams) => ["dashboard", "users", p] as const,
  messages: (p: DashboardMessagesParams) => ["dashboard", "messages", p] as const,
  audit: (p: DashboardAuditParams) => ["dashboard", "audit", p] as const,
  about: ["dashboard", "about"] as const,
  contactInfo: ["dashboard", "contact-info"] as const,
  settings: ["dashboard", "settings"] as const,
};
