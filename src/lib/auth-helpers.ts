// =====================================================
// AUTH HELPERS - Funciones de autenticación y roles
// =====================================================

import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

/**
 * Verifica si el usuario actual tiene rol de administrador
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (error) {
      // Si no hay registro, no es admin
      if (error.code === 'PGRST116') return false
      console.error('Error checking admin role:', error)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}

/**
 * Obtiene todos los roles de un usuario
 */
export async function getUserRoles(userId: string): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user roles:', error)
      return null
    }

    return data.map((r) => r.role)
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    return null
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(
  user: User | null,
  role: 'admin' | 'farmer' | 'researcher'
): Promise<boolean> {
  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return false
      console.error('Error checking role:', error)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Error in hasRole:', error)
    return false
  }
}
