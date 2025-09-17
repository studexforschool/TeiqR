'use client'

import { useMemo, useState, useCallback } from 'react'
import { Check, Edit, Trash2, Filter, Search, Calendar, Flag, BookOpen } from 'lucide-react'
import { Task, TaskCategory, TaskPriority } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (taskId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onReorder?: (orderedIds: string[]) => void
}

export default function TaskList({ tasks, onToggleComplete, onEditTask, onDeleteTask, onReorder }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const matchesStatus = filter === 'all' || 
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed)
    
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch
  }), [tasks, filter, categoryFilter, priorityFilter, searchTerm])

  const ids = useMemo(() => filteredTasks.map(t => t.id), [filteredTasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggingId(null)
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const newIds = arrayMove(ids, oldIndex, newIndex)
    onReorder?.(newIds)
  }, [ids, onReorder])

  // Sortable item component (keeps styles and handlers tidy)
  const SortableTask: React.FC<{ task: Task }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`card p-6 transition-all duration-200 hover:shadow-xl ${
          task.completed ? 'opacity-75' : ''
        } ${isDragging || draggingId === task.id ? 'ring-2 ring-primary-400' : ''}`}
        onPointerDown={() => setDraggingId(task.id)}
        onPointerCancel={() => setDraggingId(null)}
        onPointerUp={() => setDraggingId(null)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`mt-1 w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-primary-900 border-primary-900 text-white'
                  : 'border-primary-300 hover:border-primary-900'
              }`}
            >
              {task.completed && <Check className="h-3 w-3" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className={`text-lg font-semibold ${
                  task.completed ? 'line-through text-primary-600' : 'text-primary-900'
                }`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                  getCategoryColor(task.category)
                }`}>
                  {task.category}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide border ${
                  getPriorityColor(task.priority)
                }`}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className={`text-primary-700 mb-3 ${
                  task.completed ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-primary-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{formatDueDate(task.dueDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flag className="h-4 w-4" />
                  <span className="capitalize text-xs sm:text-sm">{task.priority} priority</span>
                </div>
              </div>

              {task.notes && (
                <div className="mt-3 p-3 bg-primary-50 border-l-4 border-primary-300">
                  <p className="text-sm text-primary-700">{task.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEditTask(task)}
              className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'work': return 'text-blue-600 bg-blue-50'
      case 'personal': return 'text-green-700 bg-green-50'
      case 'urgent': return 'text-red-700 bg-red-50'
      case 'project': return 'text-purple-700 bg-purple-50'
      case 'meeting': return 'text-yellow-700 bg-yellow-50'
      case 'other': return 'text-gray-700 bg-gray-50'
    }
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const dueDate = new Date(date)
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold text-primary-900 mb-6">All Tasks</h2>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-900">Filters:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-primary-300 text-sm focus:outline-none focus:border-primary-900 rounded-md"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 border border-primary-300 text-sm focus:outline-none focus:border-primary-900 rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="urgent">Urgent</option>
                <option value="project">Project</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-2 border border-primary-300 text-sm focus:outline-none focus:border-primary-900 rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">No tasks found</h3>
            <p className="text-primary-600">
              {searchTerm ? 'Try adjusting your search or filters.' : 'Create your first task to get started!'}
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids}>
              {filteredTasks.map(task => (
                <SortableTask key={task.id} task={task} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Task Summary */}
      {filteredTasks.length > 0 && (
        <div className="card p-4">
          <div className="flex justify-between items-center text-sm text-primary-700">
            <span>
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            <span>
              {filteredTasks.filter(t => t.completed).length} completed,{' '}
              {filteredTasks.filter(t => !t.completed).length} pending
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
