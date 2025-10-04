'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  MapPin,
  Thermometer,
  Droplet,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (profile?.role !== 'agricultor') {
        router.push('/dashboard/researcher')
        return
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido, {profile.name}! 🌾
          </h1>
          <p className="text-muted-foreground">
            Panel de control para monitoreo de cultivos de maíz
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Parcelas Activas
              </h3>
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-sm text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Temperatura Promedio
              </h3>
              <Thermometer className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">24°C</div>
            <p className="text-sm text-muted-foreground">
              Óptima para floración
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Humedad del Suelo
              </h3>
              <Droplet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <p className="text-sm text-muted-foreground">Nivel adecuado</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Próxima Floración
              </h3>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">15 días</div>
            <p className="text-sm text-muted-foreground">Parcela Norte</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Floración detectada en Parcela Sur
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Imagen satelital actualizada
                  </p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Recomendación de riego enviada
                  </p>
                  <p className="text-xs text-muted-foreground">Ayer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alertas y Recomendaciones
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Posible estrés hídrico
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  La parcela Este muestra signos de necesitar riego en los
                  próximos 2-3 días.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Condiciones óptimas para floración
                </p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Las parcelas Norte y Centro muestran condiciones ideales para
                  la floración.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Nueva imagen disponible
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Revisa las nuevas imágenes satelitales de MODIS para análisis
                  detallado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 Próximamente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4">
              <h4 className="font-semibold mb-2">Mapas Interactivos</h4>
              <p className="text-sm text-muted-foreground">
                Visualiza tus parcelas en mapas satelitales
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Predicciones IA</h4>
              <p className="text-sm text-muted-foreground">
                Modelos de IA para predecir floración
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Notificaciones Móviles</h4>
              <p className="text-sm text-muted-foreground">
                Recibe alertas en tu dispositivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
