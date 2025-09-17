'use client'

import { useState } from 'react'
import { User, Mail, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface SettingsProps {
  user: any
}

export default function Settings({ user }: SettingsProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (message) setMessage(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (message) setMessage(null)
  }

  const validateProfile = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfile()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profile',
          name: profileData.name,
          email: profileData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Update localStorage with new data
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('studex-user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          userData.name = profileData.name
          userData.email = profileData.email
          localStorage.setItem('studex-user', JSON.stringify(userData))
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'password',
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }
      
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const isGoogleUser = session?.user && !user?.password

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="p-6 border-b border-primary-200">
          <h1 className="text-2xl font-bold text-primary-900">Settings</h1>
          <p className="text-primary-700 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-md flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-primary-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-primary-600 hover:text-primary-900'
              }`}
            >
              Profile
            </button>
            {!isGoogleUser && (
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-primary-900 text-primary-900'
                    : 'border-transparent text-primary-600 hover:text-primary-900'
                }`}
              >
                Password
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Profile Information</h2>
              
              {isGoogleUser && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    You're signed in with Google. Some profile information is managed by your Google account.
                  </p>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                      disabled={isLoading || isGoogleUser}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  {isGoogleUser && (
                    <p className="text-primary-600 text-sm mt-1">
                      Email is managed by your Google account
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && !isGoogleUser && (
            <div className="max-w-lg">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                      placeholder="Enter current password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-900"
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-900"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-900"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
