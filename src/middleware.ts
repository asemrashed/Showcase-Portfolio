import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const SUPER_ADMIN_ONLY = ["/dashboard/users", "/dashboard/audit"];
const ADMIN_ONLY = [
  "/dashboard/categories",
  "/dashboard/hero",
  "/dashboard/reviews",
  "/dashboard/about",
  "/dashboard/contact",
  "/dashboard/messages",
  "/dashboard/settings",
];
const under = (p: string, bases: string[]) => bases.some((b) => p === b || p.startsWith(b + "/"));

/**
 * Coarse gate only. Authoritative checks (role, active flag, session version)
 * are re-done server-side on every action via requireActor() + can().
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (!req.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard")) {
    const denied =
      (under(pathname, SUPER_ADMIN_ONLY) && role !== "SUPER_ADMIN") ||
      (under(pathname, ADMIN_ONLY) && role === "DEVELOPER");
    if (denied) return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/api/upload/:path*"],
};
