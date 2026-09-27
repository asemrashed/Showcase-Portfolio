import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { authLoginSchema } from "@/lib/schemas/user";
import { rateLimit } from "@/lib/rate-limit";
import * as audit from "@/lib/services/auditService";

let dummyHash: string | undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = authLoginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Per-account brute-force guard (per-IP guard lives in authService.login)
        if (!rateLimit(`login:email:${email}`, { limit: 8, windowMs: 15 * 60_000 }).ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        // Always run a bcrypt compare to keep timing similar for unknown emails
        dummyHash ??= bcrypt.hashSync("dummy-password", 12);
        const valid = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
        if (!user || !valid || !user.active) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await audit.log(db, { actor: user, action: "auth.login", entity: "User", entityId: user.id });

        return { id: user.id, email: user.email, name: user.name, role: user.role, sessionVersion: user.sessionVersion };
      },
    }),
  ],
});
