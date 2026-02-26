import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET
      ? [
          Kakao({
            clientId: process.env.AUTH_KAKAO_ID,
            clientSecret: process.env.AUTH_KAKAO_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        loginId: { label: "이메일 또는 아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null;
        const loginId = credentials.loginId as string;
        const isEmail = loginId.includes("@");

        const user = isEmail
          ? await prisma.user.findUnique({
              where: { email: loginId },
            })
          : await prisma.user.findUnique({
              where: { username: loginId },
            });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email ?? user.username ?? "",
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});
