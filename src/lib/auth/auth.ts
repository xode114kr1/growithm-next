import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Account } from "next-auth";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  events: {
    async signIn({ account }) {
      await updateOAuthAccountTokens(account);
    },
  },
  providers: [
    GitHub({
      authorization: {
        params: {
          scope: "read:user user:email read:repo_hook write:repo_hook",
        },
      },
    }),
  ],
  session: {
    maxAge: 60 * 60 * 12,
    strategy: "jwt",
  },
});

async function updateOAuthAccountTokens(account?: Account | null) {
  if (!account || account.provider !== "github") {
    return;
  }

  const data = getOAuthAccountTokenUpdateData(account);

  if (Object.keys(data).length === 0) {
    return;
  }

  await prisma.account.updateMany({
    data,
    where: {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    },
  });
}

function getOAuthAccountTokenUpdateData(account: Account) {
  const data: {
    access_token?: string;
    expires_at?: number;
    id_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
  } = {};

  if (typeof account.access_token === "string") {
    data.access_token = account.access_token;
  }

  if (typeof account.refresh_token === "string") {
    data.refresh_token = account.refresh_token;
  }

  if (typeof account.expires_at === "number") {
    data.expires_at = account.expires_at;
  }

  if (typeof account.token_type === "string") {
    data.token_type = account.token_type;
  }

  if (typeof account.scope === "string") {
    data.scope = account.scope;
  }

  if (typeof account.id_token === "string") {
    data.id_token = account.id_token;
  }

  return data;
}
