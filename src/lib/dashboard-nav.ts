import type { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  FolderKanban,
  Tags,
  GalleryHorizontal,
  MessageSquareQuote,
  Info,
  Mail,
  Inbox,
  Users,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; roles: UserRole[] };

const ALL: UserRole[] = ["DEVELOPER", "ADMIN", "SUPER_ADMIN"];
const ADMIN_UP: UserRole[] = ["ADMIN", "SUPER_ADMIN"];
const SUPER_ONLY: UserRole[] = ["SUPER_ADMIN"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban, roles: ["DEVELOPER"] },
  { href: "/dashboard/projects", label: "All Projects", icon: FolderKanban, roles: ADMIN_UP },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, roles: ADMIN_UP },
  { href: "/dashboard/hero", label: "Hero", icon: GalleryHorizontal, roles: ADMIN_UP },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquareQuote, roles: ADMIN_UP },
  { href: "/dashboard/about", label: "About", icon: Info, roles: ADMIN_UP },
  { href: "/dashboard/contact", label: "Contact", icon: Mail, roles: ADMIN_UP },
  { href: "/dashboard/messages", label: "Messages", icon: Inbox, roles: ADMIN_UP },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ADMIN_UP },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: SUPER_ONLY },
  { href: "/dashboard/audit", label: "Audit log", icon: ScrollText, roles: SUPER_ONLY },
];

export const navForRole = (role: UserRole) => NAV_ITEMS.filter((i) => i.roles.includes(role));
