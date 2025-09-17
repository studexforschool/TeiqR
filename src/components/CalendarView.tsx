'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'

interface CalendarViewProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onToggleComplete?: (taskId: string) => void
}

export default function CalendarView({ tasks, onTaskClick, onToggleComplete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), day))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-primary-900">Calendar</h2>
            <div className="flex space-x-1 bg-primary-100 p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm font-semibold transition-colors ${
                  view === 'month' ? 'bg-primary-900 text-white' : 'text-primary-700 hover:text-primary-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm font-semibold transition-colors ${
                  view === 'week' ? 'bg-primary-900 text-white' : 'text-primary-700 hover:text-primary-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm font-semibold transition-colors ${
                  view === 'day' ? 'bg-primary-900 text-white' : 'text-primary-700 hover:text-primary-900'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-primary-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-primary-700" />
            </button>
            <h3 className="text-xl font-semibold text-primary-900 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-primary-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-primary-700" />
            </button>
          </div>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-px bg-primary-200">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-primary-100 p-3 text-center font-semibold text-primary-900">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map(day => {
              const dayTasks = getTasksForDay(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white p-2 min-h-[120px] border-r border-b border-primary-200 ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isToday ? 'bg-accent-50' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isToday ? 'text-accent-600' : 'text-primary-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={`w-full text-left p-1 text-xs font-medium text-white hover:opacity-80 transition-opacity ${
                          getPriorityColor(task.priority)
                        } ${task.completed ? 'opacity-60 line-through' : ''}`}
                      >
                        {task.title.length > 20 ? `${task.title.slice(0, 20)}...` : task.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-primary-600 font-medium">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="text-center text-primary-600 py-12">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Week view coming soon!</p>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="text-center text-primary-600 py-12">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Day view coming soon!</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h4 className="font-semibold text-primary-900 mb-3">Priority Legend</h4>
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-sm text-primary-700">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span className="text-sm text-primary-700">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-sm text-primary-700">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  )
}
