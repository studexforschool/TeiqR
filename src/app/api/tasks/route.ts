import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { logUserActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await request.json()
    
    // Here you would typically save to a database
    // For now, we'll just return the task with an ID
    const newTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Log the task creation activity
    await logUserActivity(
      session,
      'TASK_CREATED',
      {
        taskId: newTask.id,
        title: task.title,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate
      },
      request
    )

    return NextResponse.json(newTask)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await request.json()
    
    // Log the task update activity
    await logUserActivity(
      session,
      'TASK_UPDATED',
      {
        taskId: task.id,
        title: task.title,
        completed: task.completed,
        changes: task.changes || 'Task updated'
      },
      request
    )

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const taskId = url.searchParams.get('id')
    
    // Log the task deletion activity
    await logUserActivity(
      session,
      'TASK_DELETED',
      {
        taskId: taskId
      },
      request
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
