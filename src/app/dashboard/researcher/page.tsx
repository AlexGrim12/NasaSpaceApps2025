'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Database,
  FileText,
  Globe,
  Calendar,
  TrendingUp,
  Satellite,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ResearcherDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (profile?.role !== 'investigador') {
        router.push('/dashboard/farmer')
        return
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            ¡Bienvenido, {profile.name}! 🔬
          </h1>
          <p className="text-muted-foreground">
            Centro de investigación fenológica del maíz mexicano
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Datasets Disponibles
              </h3>
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">847</div>
            <p className="text-sm text-muted-foreground">
              Imágenes satelitales
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Estudios Activos
              </h3>
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">23</div>
            <p className="text-sm text-muted-foreground">En progreso</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Regiones Monitoreadas
              </h3>
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">156</div>
            <p className="text-sm text-muted-foreground">Áreas de cultivo</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Última Actualización
              </h3>
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">2h</div>
            <p className="text-sm text-muted-foreground">Datos MODIS</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Research Tools */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Herramientas de Investigación
            </h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Análisis Temporal</h3>
                    <p className="text-sm text-muted-foreground">
                      Estudios de series de tiempo de floración
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Correlación Climática</h3>
                    <p className="text-sm text-muted-foreground">
                      Relación entre clima y fenología
                    </p>
                  </div>
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mapeado Espectral</h3>
                    <p className="text-sm text-muted-foreground">
                      Análisis de índices de vegetación
                    </p>
                  </div>
                  <Satellite className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Publications */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Publicaciones Recientes
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Patrones de Floración 2024
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                  Análisis fenológico del maíz en Sinaloa usando datos MODIS
                </p>
                <p className="text-xs text-muted-foreground">
                  Por equipo BloomWatch • 15 oct 2024
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Impacto Climático en Cultivos
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300 mb-2">
                  Correlación entre temperatura y eventos de floración temprana
                </p>
                <p className="text-xs text-muted-foreground">
                  Por Leonardo G. • 8 oct 2024
                </p>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                  Metodología NASA-MODIS
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-2">
                  Optimización de algoritmos para detección de floración
                </p>
                <p className="text-xs text-muted-foreground">
                  Por Ruy C. • 1 oct 2024
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Satellite className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold">MODIS Terra/Aqua</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Datos de reflectancia superficial y índices de vegetación con
              resolución temporal diaria
            </p>
            <div className="text-sm">
              <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                250m resolución
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold">Landsat 8/9</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Imágenes multiespectrales de alta resolución para análisis
              detallado de cultivos
            </p>
            <div className="text-sm">
              <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                30m resolución
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold">VIIRS NPP</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Radiómetro de última generación para monitoreo nocturno y estudios
              de biomasa
            </p>
            <div className="text-sm">
              <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                375m resolución
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 Próximamente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4">
              <h4 className="font-semibold mb-2">API de Datos</h4>
              <p className="text-sm text-muted-foreground">
                Acceso programático a datasets
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Machine Learning</h4>
              <p className="text-sm text-muted-foreground">
                Modelos predictivos personalizables
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Colaboración</h4>
              <p className="text-sm text-muted-foreground">
                Herramientas para trabajo en equipo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
