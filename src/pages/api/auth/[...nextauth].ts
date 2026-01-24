import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD ?? "";
        const bypassEnabled =
          process.env.AUTH_BYPASS === "true" &&
          process.env.NODE_ENV !== "production";
        const adminId =
          process.env.ADMIN_ID ?? "cmkrp742n000014hh2f6546u3";

        if (
          (adminEmail && email === adminEmail && credentials.password === adminPassword) ||
          (bypassEnabled && email === adminEmail)
        ) {
          const passwordHash = adminPassword
            ? await bcrypt.hash(adminPassword, 10)
            : await bcrypt.hash(Math.random().toString(36), 10);

          const user = await prisma.user.upsert({
            where: { email },
            update: {
              name: "Admin",
              role: "ADMIN",
              passwordHash
            },
            create: {
              id: adminId,
              email,
              name: "Admin",
              role: "ADMIN",
              passwordHash
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export default NextAuth(authOptions);
