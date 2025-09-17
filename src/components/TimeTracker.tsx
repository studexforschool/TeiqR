'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Calendar, BarChart3, Timer } from 'lucide-react'

interface TimeEntry {
  id: string
  taskId?: string
  taskTitle: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  description?: string
  category: string
  createdAt: Date
}

export default function TimeTracker() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [taskTitle, setTaskTitle] = useState('')
  const [category, setCategory] = useState('work')

  useEffect(() => {
    const savedEntries = localStorage.getItem('teiqr-time-entries')
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries)
        setTimeEntries(parsed.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined,
          createdAt: new Date(entry.createdAt)
        })))
      } catch (error) {
        console.error('Error parsing saved time entries:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('teiqr-time-entries', JSON.stringify(timeEntries))
  }, [timeEntries])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && currentEntry) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000 / 60)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, currentEntry])

  const startTracking = () => {
    if (!taskTitle.trim()) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      taskTitle: taskTitle.trim(),
      startTime: new Date(),
      duration: 0,
      category,
      createdAt: new Date()
    }

    setCurrentEntry(newEntry)
    setIsTracking(true)
    setElapsedTime(0)
  }

  const pauseTracking = () => {
    setIsTracking(false)
  }

  const resumeTracking = () => {
    setIsTracking(true)
  }

  const stopTracking = () => {
    if (!currentEntry) return

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - currentEntry.startTime.getTime()) / 1000 / 60)

    const completedEntry: TimeEntry = {
      ...currentEntry,
      endTime,
      duration
    }

    setTimeEntries(prev => [completedEntry, ...prev])
    setCurrentEntry(null)
    setIsTracking(false)
    setElapsedTime(0)
    setTaskTitle('')
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getTodayTotal = () => {
    const today = new Date().toDateString()
    return timeEntries
      .filter(entry => entry.createdAt.toDateString() === today)
      .reduce((total, entry) => total + entry.duration, 0)
  }

  const getWeekTotal = () => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    return timeEntries
      .filter(entry => entry.createdAt >= weekStart)
      .reduce((total, entry) => total + entry.duration, 0)
  }

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {}
    timeEntries.forEach(entry => {
      breakdown[entry.category] = (breakdown[entry.category] || 0) + entry.duration
    })
    return breakdown
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your time and boost productivity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(getTodayTotal())}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(getWeekTotal())}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeEntries.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
              {formatTime(elapsedTime)}
            </div>
            {currentEntry && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Working on: <span className="font-medium">{currentEntry.taskTitle}</span>
              </p>
            )}
          </div>

          {!isTracking && !currentEntry ? (
            <div className="space-y-4">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
              />
              <div className="flex gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="project">Project</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
                <button
                  onClick={startTracking}
                  disabled={!taskTitle.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Start Timer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              {isTracking ? (
                <button
                  onClick={pauseTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Resume
                </button>
              )}
              <button
                onClick={stopTracking}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Entries</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeEntries.length === 0 ? (
              <div className="p-8 text-center">
                <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No time entries yet. Start tracking to see your history!</p>
              </div>
            ) : (
              timeEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{entry.taskTitle}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{entry.category}</span>
                        <span>{entry.createdAt.toLocaleDateString()}</span>
                        <span>{entry.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {entry.endTime && (
                          <span>- {entry.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatTime(entry.duration)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
