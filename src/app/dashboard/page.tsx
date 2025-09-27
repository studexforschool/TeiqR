'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { signOut } from 'next-auth/react'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Check for localStorage session first
      const localUser = typeof window !== 'undefined' && localStorage.getItem('studex-current-user')
      if (localUser) {
        try {
          const userData = JSON.parse(localUser)
          console.log('Found localStorage user:', userData)
          setUser(userData)
          setIsLoading(false)
          return
        } catch (error) {
          console.error('Error parsing local user:', error)
        }
      }
      
      // Check for demo mode
      const demoMode = typeof window !== 'undefined' && localStorage.getItem('teiqr-demo-mode')
      if (!demoMode) {
        router.replace('/auth')
        return
      }
    }
    
    if (status === 'authenticated') {
      setIsLoading(false)
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-primary-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' && !user) {
    console.log('Redirecting to auth - status:', status, 'user:', user)
    return null // Will redirect to /auth
  }
  
  console.log('Dashboard render - status:', status, 'user:', user, 'session:', session)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "absolute inset-0 w-full h-full opacity-30"
        )}
        squares={[50, 50]}
        width={30}
        height={30}
      />
      <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen">
        <Dashboard user={user || session?.user} onLogout={handleLogout} />
      </div>
    </div>
  )
}
