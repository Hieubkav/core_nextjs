import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from './prisma'
// import { sendVerificationEmail } from './email'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      from: process.env.MAIL_FROM_ADDRESS,
      // sendVerificationRequest: async ({ identifier: email, url }) => {
      //   await sendVerificationEmail(email, url)
      // },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as any).role || 'customer'
      }
      return session
    },
    async signIn({ user, account, profile, email }) {
      // Auto-assign admin role for specific email
      if (user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { role: 'admin' },
          create: {
            email: user.email,
            name: user.name || 'Admin',
            role: 'admin',
          },
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'database',
  },
}
