import { PrismaClient } from '@prisma/client';
import NextAuth from 'next-auth';
import GitHubProvider, { GithubProfile } from 'next-auth/providers/github';
import {
  CustomPrismaAdapter,
  UserService,
} from '../../../../services/userService';

const prisma = new PrismaClient();

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

const handler = NextAuth({
  debug: true,
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      const existingUserProfile = await prisma.userProfile.findFirst({
        where: { providerAccountId: account?.providerAccountId },
      });

      if (!existingUserProfile && account) {
        await UserService.registerGithubUserProfile(
          account.providerAccountId,
          profile as GithubProfile
        );
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async linkAccount(message) {
      const userProfile = await prisma.userProfile.findFirst({
        where: { providerAccountId: message.account.providerAccountId },
      });
      if (!userProfile) {
        return;
      }

      await prisma.user.update({
        where: { id: message.user.id },
        data: {
          login: userProfile.providerUserId,
          profile: {
            connect: { id: userProfile.id },
          },
        },
      });
    },
  },
});

export { handler as GET, handler as POST };
