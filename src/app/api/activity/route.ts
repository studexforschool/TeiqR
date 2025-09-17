import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { activityLogger } from '@/lib/activity'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.email !== 'devin.voegele@microsun.ch') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const action = url.searchParams.get('action')
    const hours = url.searchParams.get('hours')

    let logs
    if (userId) {
      logs = activityLogger.getUserLogs(userId)
    } else if (action) {
      logs = activityLogger.getLogsByAction(action)
    } else if (hours) {
      logs = activityLogger.getRecentLogs(parseInt(hours))
    } else {
      logs = activityLogger.getAllLogs()
    }

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
