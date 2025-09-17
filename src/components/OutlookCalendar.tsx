'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, User, MapPin, Video, MoreHorizontal } from 'lucide-react'
import { Task } from '@/types'

interface CalendarEvent extends Task {
  startTime?: string
  endTime?: string
  location?: string
  attendees?: string[]
  type?: 'task' | 'meeting' | 'event'
}

interface OutlookCalendarProps {
  tasks: Task[]
  onAddEvent?: () => void
  onEditEvent?: (event: CalendarEvent) => void
}

export default function OutlookCalendar({ tasks, onAddEvent, onEditEvent }: OutlookCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }
    
    // Next month days to fill the grid
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }
    
    return days
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 border-red-600'
      case 'high': return 'bg-orange-500 border-orange-600'
      case 'medium': return 'bg-yellow-500 border-yellow-600'
      case 'low': return 'bg-green-500 border-green-600'
      default: return 'bg-gray-500 border-gray-600'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'personal': return 'bg-green-100 text-green-800 border-green-200'
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'project': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'meeting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 text-[12px] md:text-[14px]">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 md:p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()
          const isSelected = selectedDate?.toDateString() === day.date.toDateString()
          
          return (
            <div
              key={index}
              className={`
                min-h-[84px] md:min-h-[120px] bg-white dark:bg-gray-900 p-1 md:p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className={`
                text-xs md:text-sm font-medium mb-1 md:mb-2
                ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                ${!day.isCurrentMonth ? 'text-gray-400' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, isMobile ? 2 : 3).map(task => (
                  <div
                    key={task.id}
                    className={`
                      text-[10px] md:text-xs p-1 rounded border-l-2 cursor-pointer hover:shadow-sm transition-shadow
                      ${getCategoryColor(task.category)}
                      ${getPriorityColor(task.priority)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditEvent?.(task as CalendarEvent)
                    }}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 opacity-75">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex flex-col h-full">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3"></div>
          {weekDays.map(day => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={day.toISOString()} className={`
                bg-white dark:bg-gray-900 p-3 text-center
                ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`
                  text-lg font-bold
                  ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                `}>
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Week grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
            {/* Time column */}
            <div className="bg-gray-50 dark:bg-gray-800">
              {hours.map(hour => (
                <div key={hour} className="h-16 p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const dayTasks = getTasksForDate(day)
              return (
                <div key={day.toISOString()} className="bg-white dark:bg-gray-900">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 p-1 relative hover:bg-gray-50 dark:hover:bg-gray-800">
                      {dayTasks
                        .filter(task => {
                          const taskHour = new Date(task.dueDate).getHours()
                          return taskHour === hour
                        })
                        .map(task => (
                          <div
                            key={task.id}
                            className={`
                              absolute inset-x-1 top-1 p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow
                              ${getCategoryColor(task.category)}
                            `}
                            onClick={() => onEditEvent?.(task as CalendarEvent)}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                          </div>
                        ))
                      }
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderMobileAgenda = () => {
    const daysAhead = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + i)
      return d
    })
    return (
      <div className="space-y-3">
        {daysAhead.map(d => {
          const items = getTasksForDate(d)
          return (
            <div key={d.toDateString()} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{items.length} items</div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">No items</div>
                ) : items.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onEditEvent?.(t as CalendarEvent)}
                    className="w-full text-left px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{t.title}</div>
                      <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${getCategoryColor(t.category)}`}>{t.category}</span>
                    </div>
                    {t.dueDate && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            {(['month', 'week'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors capitalize
                  ${viewMode === mode 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-4">
        {isMobile ? renderMobileAgenda() : (viewMode === 'month' ? renderMonthView() : renderWeekView())}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Work</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Meeting</span>
          </div>
        </div>
      </div>
    </div>
  )
}
