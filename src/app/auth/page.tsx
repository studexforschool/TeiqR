'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, BookOpen } from 'lucide-react'

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [authError, setAuthError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setAuthError('')

    try {
      if (isLogin) {
        // Login with credentials
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/dashboard',
          redirect: false,
        })

        if (result?.error) {
          setAuthError('Invalid email or password')
        } else if (result?.ok) {
          // Force a hard redirect to ensure session is properly set
          window.location.href = '/dashboard'
        }
      } else {
        // Signup is restricted - show error
        setAuthError('Registration is currently disabled. Contact admin for beta access.')
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Google sign in error:', error)
      setAuthError('Google sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (authError) {
      setAuthError('')
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-primary-900 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900">STUDEX</h1>
          </div>
          <p className="text-primary-700">Your personal academic companion</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-primary-600 mt-1">
                {isLogin ? 'Sign in to your account' : 'Join Studex today'}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{authError}</span>
              </div>
            )}

            {/* Beta User Info */}
            {isLogin && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Beta Test Credentials:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Admin:</strong> admin@admin.com / <b>unavailable</b></p>
                  <p><strong>Beta:</strong> beta@studex.com / password123</p>
                  <p><strong>Test:</strong> test@studex.com / password123</p>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-primary-300 rounded-md bg-white hover:bg-primary-50 transition-colors mb-6 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold text-primary-900">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-primary-600">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-900"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg py-4 mt-6 disabled:opacity-50"
              >
                {isLoading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className="text-primary-700">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setAuthError('')
                    setErrors({})
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                  }}
                  className="text-primary-900 font-semibold hover:underline"
                  disabled={isLoading}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
              {!isLogin && (
                <p className="text-primary-600 text-sm mt-2">
                  Registration is currently disabled for beta testing.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
