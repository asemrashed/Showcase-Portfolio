import type * as projectService from "@/lib/services/projectService";
import type * as categoryService from "@/lib/services/categoryService";
import type * as heroService from "@/lib/services/heroService";
import type * as reviewService from "@/lib/services/reviewService";
import type * as userService from "@/lib/services/userService";
import type * as messageService from "@/lib/services/messageService";
import type { overview } from "@/lib/services/overviewService";
import type * as auditService from "@/lib/services/auditService";
import type * as singletonService from "@/lib/services/singletonService";

/** `import type` is erased at build — safe to re-export server-only service shapes for client code. */
export type DashboardProjectsPage = Awaited<ReturnType<typeof projectService.list>>;
export type DashboardProjectRow = DashboardProjectsPage["items"][number];
export type DashboardProjectFull = Awaited<ReturnType<typeof projectService.get>>;

export type DashboardCategory = Awaited<ReturnType<typeof categoryService.list>>[number];
export type DashboardHeroSlide = Awaited<ReturnType<typeof heroService.list>>[number];
export type DashboardReview = Awaited<ReturnType<typeof reviewService.list>>[number];

export type DashboardUsersPage = Awaited<ReturnType<typeof userService.list>>;
export type DashboardUser = DashboardUsersPage["items"][number];

export type DashboardMessagesPage = Awaited<ReturnType<typeof messageService.list>>;
export type DashboardMessage = DashboardMessagesPage["items"][number];
export type DashboardMessageFull = Awaited<ReturnType<typeof messageService.get>>;

export type DashboardOverview = Awaited<ReturnType<typeof overview>>;

export type DashboardAuditPage = Awaited<ReturnType<typeof auditService.list>>;
export type DashboardAuditRow = DashboardAuditPage["items"][number];

export type DashboardAbout = Awaited<ReturnType<typeof singletonService.getAbout>>;
export type DashboardContactInfo = Awaited<ReturnType<typeof singletonService.getContactInfo>>;
export type DashboardSettings = Awaited<ReturnType<typeof singletonService.getSettings>>;
