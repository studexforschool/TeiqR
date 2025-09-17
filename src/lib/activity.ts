// Activity logging system
export interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  details: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

class ActivityLogger {
  private logs: ActivityLog[] = []

  async logActivity(
    userId: string,
    userEmail: string,
    userName: string,
    action: string,
    details: any,
    request?: Request
  ): Promise<void> {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userEmail,
      userName,
      action,
      details,
      timestamp: new Date(),
      ipAddress: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent') || undefined
    }

    this.logs.push(log)
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    console.log(`[ACTIVITY] ${userEmail} - ${action}:`, details)
  }

  private getClientIP(request?: Request): string | undefined {
    if (!request) return undefined
    
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      undefined
    )
  }

  getAllLogs(): ActivityLog[] {
    return [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getUserLogs(userId: string): ActivityLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getLogsByAction(action: string): ActivityLog[] {
    return this.logs
      .filter(log => log.action === action)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getRecentLogs(hours: number = 24): ActivityLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.logs
      .filter(log => log.timestamp > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  clearLogs(): void {
    this.logs = []
  }
}

// Singleton instance
export const activityLogger = new ActivityLogger()

// Helper function to log common activities
export const logUserActivity = async (
  session: any,
  action: string,
  details: any,
  request?: Request
) => {
  if (session?.user) {
    await activityLogger.logActivity(
      session.user.id || session.user.email,
      session.user.email || 'unknown',
      session.user.name || 'Unknown User',
      action,
      details,
      request
    )
  }
}
