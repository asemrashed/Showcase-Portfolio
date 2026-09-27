import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/** Edge-safe config (no DB / bcrypt) — shared by middleware and auth.ts */
export const authConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // HttpOnly cookie, 8h
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.sv = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string;
        session.user.role = token.role as UserRole;
        session.user.sessionVersion = (token.sv as number | undefined) ?? 0;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
