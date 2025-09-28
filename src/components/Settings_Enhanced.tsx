'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface SettingsProps {
  user: {
    id: string
    name: string
    email: string
  }
}

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt'

interface UserSettings {
  theme: Theme
  language: Language
  notifications: {
    email: boolean
    push: boolean
    taskReminders: boolean
    projectUpdates: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showActivity: boolean
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
]

export default function SettingsEnhanced({ user }: SettingsProps) {
  const { language: currentLanguage, setLanguage: updateLanguage } = useLanguage()
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences' | 'privacy'>('profile')
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: currentLanguage as Language,
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      projectUpdates: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showActivity: true
    }
  })
  
  // Profile form
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: '',
    school: '',
    grade: ''
  })
  
  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('studex-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    
    const savedProfile = localStorage.getItem('studex-profile')
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('studex-settings', JSON.stringify(settings))
      localStorage.setItem('studex-profile', JSON.stringify(profileData))
      
      // Apply language
      updateLanguage(settings.language)
      
      // Apply theme
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      setTimeout(() => {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 500)
    } catch (error) {
      setSaveStatus('error')
      console.error('Error saving settings:', error)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    try {
      // In a real app, this would be an API call
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      if (response.ok) {
        setSaveStatus('saved')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        const data = await response.json()
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would be an API call
      console.log('Account deletion requested')
    }
  }

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      case 'system': return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="relative p-4 sm:p-6 bg-white dark:bg-gray-900 min-h-screen">
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "absolute inset-0 w-full h-full opacity-10"
        )}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 sm:mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'account', label: 'Account', icon: Shield },
            { id: 'preferences', label: 'Prefs', icon: Globe },
            { id: 'privacy', label: 'Privacy', icon: Lock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-0",
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School/University
                  </label>
                  <input
                    type="text"
                    value={profileData.school}
                    onChange={(e) => setProfileData(prev => ({ ...prev, school: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your institution"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade/Year
                  </label>
                  <input
                    type="text"
                    value={profileData.grade}
                    onChange={(e) => setProfileData(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Sophomore, Year 3"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Security</h2>
              
              {/* Change Password Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                    {passwordError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePasswordChange}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Update Password
                </button>
              </div>

              {/* Delete Account Section */}
              <div className="pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
              
              {/* Language Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Language</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, language: lang.code as Language }))
                        updateLanguage(lang.code as Language)
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors",
                        settings.language === lang.code
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                      {settings.language === lang.code && (
                        <Check className="w-4 h-4 text-primary-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setSettings(prev => ({ ...prev, theme }))}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 capitalize transition-colors",
                        settings.theme === theme
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      {getThemeIcon(theme)}
                      <span className="font-medium text-gray-900 dark:text-white">{theme}</span>
                      {settings.theme === theme && (
                        <Check className="w-4 h-4 text-primary-600 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email notifications' },
                    { key: 'push', label: 'Push notifications' },
                    { key: 'taskReminders', label: 'Task reminders' },
                    { key: 'projectUpdates', label: 'Project updates' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [item.key]: e.target.checked }
                        }))}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'profileVisible', label: 'Make profile visible to others', description: 'Other users can view your profile information' },
                  { key: 'showEmail', label: 'Show email address', description: 'Display your email on your public profile' },
                  { key: 'showActivity', label: 'Show activity status', description: 'Let others see when you are online' }
                ].map(item => (
                  <div key={item.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, [item.key]: e.target.checked }
                        }))}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className={cn(
              "px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2",
              saveStatus === 'saved' 
                ? "bg-green-600 text-white"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
