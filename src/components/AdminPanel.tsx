'use client'

import { useState, useEffect } from 'react'
import { User, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface AdminUser {
  id: string
  name: string
  email: string
  isActive: boolean
  authProvider: string
  createdAt: string
  lastLogin?: string
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch users' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching users' })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!newUser.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!newUser.password) {
      newErrors.password = 'Password is required'
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setMessage({ type: 'success', text: 'User created successfully!' })
      setNewUser({ name: '', email: '', password: '' })
      setShowAddForm(false)
      fetchUsers() // Refresh the list
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create user' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (message) setMessage(null)
  }

  // Check if current user is admin
  const isAdmin = session?.user?.email === 'admin@studex.com'

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Access Denied</h2>
          <p className="text-primary-700">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Admin Panel</h1>
              <p className="text-primary-700 mt-1">Manage beta users and system settings</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>
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

        {/* Add User Form */}
        {showAddForm && (
          <div className="p-6 border-b border-primary-200 bg-primary-50">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Add New Beta User</h3>
            <form onSubmit={handleAddUser} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter full name"
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewUser({ name: '', email: '', password: '' })
                    setErrors({})
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-primary-900">Beta Users ({users.length})</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900 mx-auto mb-4"></div>
              <p className="text-primary-700">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Auth Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-primary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary-900">{user.name}</div>
                            <div className="text-sm text-primary-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.authProvider === 'google' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.authProvider}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
