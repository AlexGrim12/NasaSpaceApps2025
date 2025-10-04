import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'agricultor' | 'investigador'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  created_at: string
  updated_at: string
}
