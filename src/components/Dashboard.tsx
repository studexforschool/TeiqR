'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  LogOut, 
  Settings as SettingsIcon, 
  Shield, 
  MessageCircle, 
  X, 
  List, 
  TrendingUp,
  Bot,
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import TaskModal from './TaskModal_enhanced'
import TaskList from './TaskList'
import Settings from './Settings'
import ProjectManager from './ProjectManager'
import TimeTracker from './TimeTracker'
import AIAssistant from './AIAssistant'
import OutlookCalendar from './OutlookCalendar'
import { Task } from '@/types'

interface DashboardProps {
  user: {
    id: string
    name: string
    email: string
  }
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'calendar' | 'projects' | 'time' | 'chat' | 'settings'>('dashboard')
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  // Quick add
  const [quickTitle, setQuickTitle] = useState('')
  // Focus timer (Pomodoro style)
  const [focusRunning, setFocusRunning] = useState(false)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)

  useEffect(() => {
    const savedTasks = localStorage.getItem('teiqr-tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Error parsing saved tasks:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('teiqr-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Focus timer tick
  useEffect(() => {
    if (!focusRunning) return
    const id = setInterval(() => {
      setFocusSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [focusRunning])

  useEffect(() => {
    if (focusSeconds === 0 && focusRunning) {
      setFocusRunning(false)
      // Optional: toast or sound
    }
  }, [focusSeconds, focusRunning])

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: 'todo'
    }
    setTasks(prev => [...prev, newTask])
    setShowTaskModal(false)
  }

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'updatedAt' | 'status'>) => {
    if (!editingTask) return
    const updatedTask: Task = { 
      ...editingTask, 
      ...taskData, 
      updatedAt: new Date()
    }
    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task))
    setEditingTask(null)
    setShowTaskModal(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const upcomingTasks = tasks.filter(task => !task.completed).slice(0, 5)
  const workTasks = tasks.filter(task => task.category === 'work').length
  const personalTasks = tasks.filter(task => task.category === 'personal').length
  const urgentTasks = tasks.filter(task => task.category === 'urgent').length
  const completedToday = tasks.filter(task => 
    task.completed && 
    new Date(task.createdAt).toDateString() === new Date().toDateString()
  ).length
  const totalTasks = tasks.filter(task => !task.completed).length
  const thisWeekCompleted = tasks.filter(task => {
    const taskDate = new Date(task.createdAt)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    return taskDate >= weekStart && task.completed
  }).length
  
  const recentActivity = [...tasks]
    .sort((a,b) => new Date(b.updatedAt || b.createdAt as any).getTime() - new Date(a.updatedAt || a.createdAt as any).getTime())
    .slice(0, 5)

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${m}:${ss}`
  }

  const handleQuickAdd = () => {
    const title = quickTitle.trim()
    if (!title) return
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description: '',
      priority: 'medium',
      category: 'other',
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: 'todo'
    }
    setTasks(prev => [newTask, ...prev])
    setQuickTitle('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                TeiqR
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-6">
                {[
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'calendar', label: 'Calendar' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'time', label: 'Time Tracker' },
                  { key: 'chat', label: 'Assistant' },
                  { key: 'settings', label: 'Settings' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key as any)}
                    className={`text-sm font-medium transition-colors ${
                      activeView === key 
                        ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-4' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pb-4'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {user?.email === 'devin.voegele@microsun.ch' && (
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'dashboard' 
                        ? 'bg-black dark:bg-white text-white dark:text-black' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Admin
                  </button>
                )}
              </nav>
              
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user.name}</span>
                <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <nav className="flex space-x-1 overflow-x-auto">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'calendar', label: 'Calendar' },
              { key: 'tasks', label: 'Tasks' },
              { key: 'chat', label: 'AI Help' },
              { key: 'settings', label: 'Settings' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeView === key 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Here's your task overview for today.
              </p>
            </div>

            {/* Quick Add + Focus Timer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Add */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Add Task</label>
                <div className="flex gap-2">
                  <input
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAdd() } }}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                    placeholder="Task title..."
                  />
                  <button onClick={handleQuickAdd} className="px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Focus Timer */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Timer</span>
                  </div>
                  <button onClick={() => { setFocusRunning(false); setFocusSeconds(25*60) }} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Reset
                  </button>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{formatTime(focusSeconds)}</div>
                <div className="flex gap-2">
                  {!focusRunning ? (
                    <button onClick={() => setFocusRunning(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                      <Play className="w-4 h-4" /> Start
                    </button>
                  ) : (
                    <button onClick={() => setFocusRunning(false)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}
                  <button onClick={() => { setFocusRunning(false); setFocusSeconds(5*60) }} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
                    5m
                  </button>
                  <button onClick={() => { setFocusRunning(false); setFocusSeconds(25*60) }} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
                    25m
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalTasks}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <List className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{workTasks}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{urgentTasks}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Today</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completedToday}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  View all
                </button>
              </div>
              
              {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming tasks. Great job staying on top of things!
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium uppercase tracking-wide rounded-full ${
                        task.category === 'work' ? 'bg-blue-100 text-blue-800' :
                        task.category === 'personal' ? 'bg-green-100 text-green-800' :
                        task.category === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.category === 'project' ? 'bg-purple-100 text-purple-800' :
                        task.category === 'meeting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500">No recent changes.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentActivity.map((t) => (
                    <li key={t.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Updated {new Date(t.updatedAt || t.createdAt as any).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${t.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {t.completed ? 'Completed' : (t.status || 'todo')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <TaskList 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEditTask={openEditModal}
            onDeleteTask={handleDeleteTask}
            onReorder={(orderedIds) => {
              setTasks(prev => {
                const map = new Map(prev.map(t => [t.id, t]))
                const reordered: Task[] = []
                orderedIds.forEach(id => {
                  const t = map.get(id)
                  if (t) reordered.push(t)
                })
                // append any tasks not in filtered view/order to preserve
                prev.forEach(t => {
                  if (!orderedIds.includes(t.id)) reordered.push(t)
                })
                return reordered
              })
            }}
          />
        )}

        {activeView === 'calendar' && (
          <OutlookCalendar 
            tasks={tasks}
            onAddEvent={() => setShowTaskModal(true)}
            onEditEvent={(event) => openEditModal(event as Task)}
          />
        )}

        {activeView === 'projects' && <ProjectManager />}

        {activeView === 'time' && <TimeTracker />}

        {activeView === 'settings' && <Settings user={user} />}

        {activeView === 'chat' && <AIAssistant />}
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSave={editingTask ? handleEditTask : handleAddTask}
        />
      )}
    </div>
  )
}
