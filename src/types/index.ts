export type TaskCategory = 'work' | 'personal' | 'urgent' | 'project' | 'meeting' | 'other'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  dueDate: Date
  completed: boolean
  createdAt: Date
  updatedAt: Date
  notes?: string
  attachments?: string[]
  tags?: string[]
  subtasks?: Subtask[]
  estimatedHours?: number
  actualHours?: number
  assignedTo?: string
  projectId?: string
}

export interface User {
  id: string
  name: string
  email: string
  school: string
  grade: string
}
