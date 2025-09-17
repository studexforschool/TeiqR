// User database management
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  password?: string // Optional for OAuth users
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
  authProvider: 'credentials' | 'google'
}

// Beta users - in production, this would be in a real database
class UserDatabase {
  private users: User[] = []

  constructor() {
    this.initializeBetaUsers()
  }

  private async initializeBetaUsers() {
    // Initialize beta users with hashed passwords
    const betaUsers: User[] = [
      {
        id: 'admin-001',
        name: 'Devin Voegele',
        email: 'devin.voegele@microsun.ch',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        authProvider: 'credentials' as const,
        createdAt: new Date()
      },
      {
        id: 'beta-001',
        name: 'Beta User',
        email: 'beta@studex.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        authProvider: 'credentials' as const,
        createdAt: new Date()
      },
      {
        id: 'test-001',
        name: 'Test User',
        email: 'test@studex.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        authProvider: 'credentials' as const,
        createdAt: new Date()
      }
    ]

    this.users = betaUsers
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // Generate new ID
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date(),
    }

    this.users.push(newUser)
    return newUser
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
    }

    return this.users[userIndex]
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = this.users.find(user => user.id === id)
    if (user) {
      user.lastLogin = new Date()
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || !user.password || !user.isActive) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    await this.updateLastLogin(user.id)
    return user
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.findById(id)
    if (!user || !user.password) return false

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentValid) return false

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    await this.updateUser(id, { password: hashedNewPassword })
    return true
  }

  async updateProfile(id: string, name: string, email: string): Promise<User | null> {
    // Check if email is already taken by another user
    const existingUser = await this.findByEmail(email)
    if (existingUser && existingUser.id !== id) {
      throw new Error('Email already in use')
    }

    return await this.updateUser(id, { name, email })
  }

  // Get all users (admin function)
  getAllUsers(): User[] {
    return this.users.map(user => ({ ...user, password: undefined })) // Don't expose passwords
  }
}

// Singleton instance
export const userDb = new UserDatabase()

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}
