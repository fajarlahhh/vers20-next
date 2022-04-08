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

        return {
          username: accounts.usename,
          contract: accounts.contract,
        };
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
});
