'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Check for demo mode first
      const demoMode = typeof window !== 'undefined' && localStorage.getItem('teiqr-demo-mode')
      if (!demoMode) {
        router.replace('/auth')
        return
      }
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
    } else if (status === 'unauthenticated') {
      // Check localStorage for user data (fallback for demo mode)
      try {
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('studex-user')
          const demoMode = localStorage.getItem('studex-demo-mode')
          if (savedUser && demoMode) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
      }
    }
  }, [session, status])

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studex-user')
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
    
    await signOut({ callbackUrl: '/auth' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-primary-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect to /auth
  }

  return <Dashboard user={user || session?.user} onLogout={handleLogout} />
}
