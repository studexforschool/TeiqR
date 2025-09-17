'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, Clock, User, Eye, Filter, Search } from 'lucide-react'

interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  details: any
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export default function ActivityMonitor() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('24')

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (timeFilter !== 'all') {
        params.append('hours', timeFilter)
      }
      
      const response = await fetch(`/api/activity?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }, [timeFilter])

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [timeFilter, fetchLogs])

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action.toLowerCase().includes(filter.toLowerCase())
    const matchesSearch = searchTerm === '' || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return 'text-green-600 bg-green-50'
      case 'USER_LOGOUT': return 'text-gray-600 bg-gray-50'
      case 'TASK_CREATED': return 'text-blue-600 bg-blue-50'
      case 'TASK_UPDATED': return 'text-yellow-600 bg-yellow-50'
      case 'TASK_DELETED': return 'text-red-600 bg-red-50'
      case 'PROFILE_UPDATED': return 'text-purple-600 bg-purple-50'
      case 'PASSWORD_CHANGED': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const renderDetails = (action: string, details: any) => {
    switch (action) {
      case 'TASK_CREATED':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">&ldquo;{details.title}&rdquo;</span> - 
            {details.category} ({details.priority} priority)
            {details.dueDate && <span> - Due: {new Date(details.dueDate).toLocaleDateString()}</span>}
          </div>
        )
      case 'TASK_UPDATED':
        return (
          <div className="text-sm text-gray-600">
            <span className="font-medium">&ldquo;{details.title}&rdquo;</span>
            {details.completed !== undefined && (
              <span> - {details.completed ? 'Completed' : 'Uncompleted'}</span>
            )}
          </div>
        )
      case 'TASK_DELETED':
        return (
          <div className="text-sm text-gray-600">
            Task ID: {details.taskId}
          </div>
        )
      case 'PROFILE_UPDATED':
        return (
          <div className="text-sm text-gray-600">
            Updated: {Object.keys(details.updates || {}).join(', ')}
          </div>
        )
      case 'USER_LOGIN':
        return (
          <div className="text-sm text-gray-600">
            Provider: {details.provider || 'credentials'}
          </div>
        )
      default:
        return (
          <div className="text-sm text-gray-600">
            {JSON.stringify(details, null, 2)}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary-900" />
          <h2 className="text-2xl font-bold text-primary-900">Activity Monitor</h2>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Action Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login/Logout</option>
              <option value="task">Task Actions</option>
              <option value="profile">Profile Changes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Time Range
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1">Last Hour</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last Week</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users, actions, details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity ({filteredLogs.length} entries)
          </h3>
        </div>

        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activity found matching your filters.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {log.userName || 'Unknown User'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({log.userEmail})
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                      {renderDetails(log.action, log.details)}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatTimestamp(log.timestamp)}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
