import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { userDb, hashPassword } from '@/lib/users'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await userDb.findByEmail(session.user.email)
    if (!user || user.email !== 'devin.voegele@microsun.ch') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const users = userDb.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await userDb.findByEmail(session.user.email)
    if (!user || user.email !== 'devin.voegele@microsun.ch') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const newUser = {
      email,
      name,
      password: hashedPassword,
      isActive: true,
      authProvider: 'credentials' as const
    }

    try {
      const createdUser = await userDb.createUser(newUser)
      const { password: _, ...userWithoutPassword } = createdUser
      return NextResponse.json({ success: true, user: userWithoutPassword })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
