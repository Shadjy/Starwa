import bcrypt from "bcryptjs"
import { query, queryOne } from "./db"

export interface User {
  id: number
  email: string
  role: "werkgever" | "werkzoeker" | "admin"
  created_at: Date
}

export interface Profile {
  id: number
  user_id: number
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  questionnaire_completed: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, role: "werkgever" | "werkzoeker"): Promise<User> {
  const passwordHash = await hashPassword(password)

  const result: any = await query("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)", [
    email,
    passwordHash,
    role,
  ])

  const userId = result.insertId

  // Create empty profile
  await query("INSERT INTO profiles (user_id, questionnaire_completed) VALUES (?, FALSE)", [userId])

  return {
    id: userId,
    email,
    role,
    created_at: new Date(),
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await queryOne<User & { password_hash: string }>(
    "SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?",
    [email],
  )

  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  return queryOne<User>("SELECT id, email, role, created_at FROM users WHERE id = ?", [userId])
}

export async function getUserProfile(userId: number): Promise<Profile | null> {
  return queryOne<Profile>("SELECT * FROM profiles WHERE user_id = ?", [userId])
}
