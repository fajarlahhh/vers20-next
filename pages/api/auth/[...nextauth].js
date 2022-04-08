/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import models from '../../../db/models';
import bcryptjs from 'bcryptjs';

const Accounts = models.accounts;

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        const { username, password } = credentials;
        const accounts = await Accounts.findOne(
          {
            where: {
              username,
            },
          },
          {
            include: ['contract'],
          },
        );

        if (!accounts) {
          return null;
        }

        if (!bcryptjs.compareSync(password, accounts.password)) {
          return null;
        }

        return accounts;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.wallet = user.walletAddress;
        token.contract = user.contract;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        username: token.username,
        wallet: token.wallet,
        contract: token.contract,
      };
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
