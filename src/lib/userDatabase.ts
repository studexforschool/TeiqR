import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  password?: string
  authProvider: 'credentials' | 'google'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  language?: string
  theme?: 'light' | 'dark' | 'system'
  notifications?: boolean
}

class UserDatabase {
  private storageKey = 'studex-users'
  
  private getUsers(): User[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  
  private saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.storageKey, JSON.stringify(users))
  }
  
  async createUser(data: {
    email: string
    name: string
    password?: string
    authProvider: 'credentials' | 'google'
  }): Promise<User> {
    const users = this.getUsers()
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists')
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      authProvider: data.authProvider,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'en',
      theme: 'system',
      notifications: true
    }
    
    users.push(newUser)
    this.saveUsers(users)
    return newUser
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsers()
    return users.find(u => u.email === email) || null
  }
  
  async findById(id: string): Promise<User | null> {
    const users = this.getUsers()
    return users.find(u => u.id === id) || null
  }
  
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || !user.password) return null
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null
    
    return user
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === id)
    
    if (index === -1) return null
    
    // If updating password, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10)
    }
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date()
    }
    
    this.saveUsers(users)
    return users[index]
  }
  
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.findById(id)
    if (!user || !user.password) return false
    
    const isValid = await bcrypt.compare(oldPassword, user.password)
    if (!isValid) return false
    
    await this.updateUser(id, { password: newPassword })
    return true
  }
}

export const userDatabase = new UserDatabase()
