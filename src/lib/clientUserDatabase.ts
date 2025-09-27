// Client-side user database for authentication
// This replaces the server-side bcrypt with a client-compatible solution

export interface User {
  id: string
  email: string
  name: string
  password?: string
  authProvider: 'credentials' | 'google'
  isActive: boolean
  createdAt: string
  updatedAt: string
  language?: string
  theme?: 'light' | 'dark' | 'system'
  notifications?: boolean
}

class ClientUserDatabase {
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
  
  // Simple hash function for demo purposes
  private hashPassword(password: string): string {
    // In production, use proper hashing on server-side
    return btoa(password)
  }
  
  private verifyPasswordHash(password: string, hash: string): boolean {
    return btoa(password) === hash
  }
  
  createUser(data: {
    email: string
    name: string
    password?: string
    authProvider: 'credentials' | 'google'
  }): User {
    const users = this.getUsers()
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists')
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      password: data.password ? this.hashPassword(data.password) : undefined,
      authProvider: data.authProvider,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      theme: 'system',
      notifications: true
    }
    
    users.push(newUser)
    this.saveUsers(users)
    return newUser
  }
  
  findByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.email === email) || null
  }
  
  findById(id: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.id === id) || null
  }
  
  verifyPassword(email: string, password: string): User | null {
    const user = this.findByEmail(email)
    if (!user || !user.password) return null
    
    const isValid = this.verifyPasswordHash(password, user.password)
    if (!isValid) return null
    
    return user
  }
  
  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === id)
    
    if (index === -1) return null
    
    // If updating password, hash it
    if (updates.password) {
      updates.password = this.hashPassword(updates.password)
    }
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveUsers(users)
    return users[index]
  }
  
  changePassword(id: string, oldPassword: string, newPassword: string): boolean {
    const user = this.findById(id)
    if (!user || !user.password) return false
    
    const isValid = this.verifyPasswordHash(oldPassword, user.password)
    if (!isValid) return false
    
    this.updateUser(id, { password: newPassword })
    return true
  }
}

export const clientUserDatabase = new ClientUserDatabase()
