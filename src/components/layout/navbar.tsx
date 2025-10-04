'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Sprout, User, LogOut, BarChart3, Award, Trophy } from 'lucide-react'

export function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold">BloomWatch</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Public Ranking Link */}
          <Link
            href="/rankings"
            className="text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1"
          >
            <Trophy className="h-4 w-4" />
            <span>Ranking</span>
          </Link>

          {user ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  {profile?.role === 'agricultor'
                    ? 'Agricultor'
                    : 'Investigador'}
                </span>
              </div>

              {profile?.role === 'agricultor' ? (
                <>
                  <Link
                    href="/dashboard/farmer"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/contributions"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1"
                  >
                    <Award className="h-4 w-4" />
                    <span>Contribuir</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard/researcher"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Análisis
                </Link>
              )}

              <button
                onClick={signOut}
                className="text-sm font-medium text-red-600 transition-colors hover:text-red-500"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Registrarse
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
