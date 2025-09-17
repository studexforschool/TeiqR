'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Create a demo user session in localStorage
    const demoUser = {
      id: 'demo-user',
      name: 'Demo Student',
      email: 'demo@studex.com',
      school: 'Demo University',
      grade: '12th Grade'
    }
    
    localStorage.setItem('studex-user', JSON.stringify(demoUser))
    localStorage.setItem('studex-demo-mode', 'true')
    
    // Redirect to dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
        <p className="text-primary-700">Setting up demo...</p>
      </div>
    </div>
  )
}
