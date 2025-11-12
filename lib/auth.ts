import NextAuth, { AuthError, CredentialsProvider } from "next-auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

type UserWithRole = {
  id: string;
  email: string;
  role: "admin" | "artist" | "venue";
  artistId?: string | null;
  venueId?: string | null;
};

type SessionUser = UserWithRole;

type AppSession = {
  user: SessionUser;
};

type TokenShape = {
  sub?: string;
  email?: string;
  role?: string;
  artistId?: string | null;
  venueId?: string | null;
  exp?: number;
};

const { auth, signIn, signOut, handlers } = NextAuth<
  Record<string, unknown>,
  UserWithRole,
  TokenShape,
  AppSession
>({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const email = String(credentials.email ?? "").toLowerCase();
        const password = String(credentials.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            artist: true,
            venue: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          artistId: user.artistId,
          venueId: user.venueId,
        } satisfies UserWithRole;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
        token.artistId = user.artistId ?? null;
        token.venueId = user.venueId ?? null;
      }
      return token;
    },
    async session({ token }) {
      const typedSession: AppSession = {
        user: {
          id: String(token.sub ?? ""),
          email: String(token.email ?? ""),
          role: (token.role as SessionUser["role"]) ?? "artist",
          artistId: (token.artistId as string | null) ?? null,
          venueId: (token.venueId as string | null) ?? null,
        },
      };

      return typedSession;
    },
  },
});

export { auth, signIn, signOut, handlers, AuthError };
export type { AppSession, SessionUser };
