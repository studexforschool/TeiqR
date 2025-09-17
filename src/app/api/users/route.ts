import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { userDb } from '@/lib/users'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userDb.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userDb.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, ...data } = body

    if (type === 'profile') {
      const { name, email } = data
      
      try {
        const updatedUser = await userDb.updateProfile(user.id, name, email)
        if (!updatedUser) {
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
        }
        
        const { password, ...userWithoutPassword } = updatedUser
        return NextResponse.json({ success: true, user: userWithoutPassword })
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    if (type === 'password') {
      const { currentPassword, newPassword } = data
      
      const success = await userDb.changePassword(user.id, currentPassword, newPassword)
      if (!success) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
