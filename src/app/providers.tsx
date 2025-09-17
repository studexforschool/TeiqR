'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NextAuthSessionProvider>
  )
}
