import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logUserActivity } from '@/lib/activity'

const handler = NextAuth({
  ...authOptions,
  events: {
    async signIn({ user, account }) {
      await logUserActivity(
        { user },
        'USER_LOGIN',
        {
          provider: account?.provider,
          loginTime: new Date().toISOString()
        }
      )
    },
    async signOut({ session }) {
      if (session?.user) {
        await logUserActivity(
          { user: session.user },
          'USER_LOGOUT',
          {
            logoutTime: new Date().toISOString()
          }
        )
      }
    }
  }
})

export { handler as GET, handler as POST }
