import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Ingat Saya", type: "checkbox" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          username: credentials?.username,
          password: credentials?.password,
          remember: credentials?.remember,
        });

        if (!parsed.success) {
          throw new Error("Username atau password salah");
        }

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          select: {
            id: true,
            username: true,
            passwordHash: true,
            role: true,
            status: true,
          },
        });

        if (!user) {
          throw new Error("Username atau password salah");
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          throw new Error("Username atau password salah");
        }

        if (user.status === "DISABLED") {
          throw new Error("Akun dinonaktifkan");
        }

        return {
          id: user.id,
          name: user.username,
          username: user.username,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.username = user.username;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.status = token.status;
      }

      return session;
    },
  },
});
