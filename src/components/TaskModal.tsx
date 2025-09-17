'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Flag, BookOpen, FileText, Award } from 'lucide-react'
import { Task, TaskCategory, TaskPriority, TaskGrade } from '@/types'

interface TaskModalProps {
  task?: Task | null
  onClose: () => void
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>) => void
}

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'homework' as TaskCategory,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    completed: false,
    notes: '',
    grade: null as TaskGrade
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        completed: task.completed,
        notes: task.notes || '',
        grade: task.grade || null
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.dueDate) {
      return
    }

    onSave({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      completed: formData.completed,
      notes: formData.notes,
      grade: formData.grade
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let processedValue: any = value
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked
    } else if (name === 'grade') {
      // Convert grade to number and round to 1 decimal place
      const numValue = parseFloat(value)
      processedValue = isNaN(numValue) ? null : Math.round(numValue * 10) / 10
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900">
              {task ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-primary-600 hover:text-primary-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Add task description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Category
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                  >
                    <option value="homework">Homework</option>
                    <option value="exams">Exams</option>
                    <option value="projects">Projects</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Priority
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Due Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Grade (Swiss Scale 1-6, Optional)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
                  <input
                    type="number"
                    name="grade"
                    value={formData.grade || ''}
                    onChange={handleInputChange}
                    min="1"
                    max="6"
                    step="0.1"
                    className="input-field pl-10"
                    placeholder="e.g. 5.5"
                  />
                </div>
                <p className="text-xs text-primary-600 mt-1">
                  Swiss grading: 6 = excellent, 5 = good, 4 = sufficient, 3 = insufficient, 2 = poor, 1 = very poor
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-primary-600" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field pl-10 resize-none"
                  placeholder="Add any additional notes or details..."
                />
              </div>
            </div>

            {task && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="completed"
                  checked={formData.completed}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-900 border-primary-300 focus:ring-primary-900"
                />
                <label className="ml-2 text-sm font-semibold text-primary-900">
                  Mark as completed
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
