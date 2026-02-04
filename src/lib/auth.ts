import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'שם משתמש', type: 'text' },
        password: { label: 'סיסמה', type: 'password' },
        securityAnswer1: { label: 'שם בית ספר יסודי', type: 'text' },
        securityAnswer2: { label: 'שם חיית מחמד', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('נא להזין שם משתמש וסיסמה')
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { business: true },
        })

        if (!user) {
          throw new Error('שם משתמש או סיסמה שגויים')
        }

        // Check regular password
        let isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        // If regular password fails, check temp password for admin
        if (!isPasswordValid && user.role === 'admin' && user.tempPassword) {
          const isTempValid = await bcrypt.compare(credentials.password, user.tempPassword)
          const isNotExpired = user.tempPasswordExpiry && new Date() < user.tempPasswordExpiry
          
          if (isTempValid && isNotExpired) {
            isPasswordValid = true
            // Clear temp password after use
            await prisma.user.update({
              where: { id: user.id },
              data: { tempPassword: null, tempPasswordExpiry: null },
            })
          }
        }

        if (!isPasswordValid) {
          throw new Error('שם משתמש או סיסמה שגויים')
        }

        // Admin doesn't need security questions
        if (user.role === 'admin') {
          return {
            id: user.id,
            username: user.username,
            businessName: user.businessName,
            role: user.role,
            businessId: user.business?.id || null,
          }
        }

        // Regular users must answer security questions
        if (!credentials.securityAnswer1 || !credentials.securityAnswer2) {
          throw new Error('נא לענות על שאלות הביטחון')
        }

        const isAnswer1Valid = await bcrypt.compare(
          credentials.securityAnswer1.toLowerCase().trim(),
          user.securityAnswer1
        )
        const isAnswer2Valid = await bcrypt.compare(
          credentials.securityAnswer2.toLowerCase().trim(),
          user.securityAnswer2
        )

        if (!isAnswer1Valid || !isAnswer2Valid) {
          throw new Error('תשובות שאלות הביטחון שגויות')
        }

        return {
          id: user.id,
          username: user.username,
          businessName: user.businessName,
          role: user.role,
          businessId: user.business?.id || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.businessName = user.businessName
        token.role = user.role
        token.businessId = user.businessId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          businessName: token.businessName as string,
          role: token.role as string,
          businessId: token.businessId as string | null,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}
