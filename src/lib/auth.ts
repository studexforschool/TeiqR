import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { userDb } from './users'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await userDb.verifyPassword(credentials.email, credentials.password)
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if Google user exists in our user database
        const existingUser = await userDb.findByEmail(user.email!)
        if (!existingUser) {
          // Create user record for any Google user (open access)
          try {
            await userDb.createUser({
              email: user.email!,
              name: user.name!,
              isActive: true,
              authProvider: 'google'
            })
          } catch (error) {
            console.error('Error creating Google user:', error)
            return false
          }
        }
      }
      return true
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
}

export const getAuthSession = () => getServerSession(authOptions)
