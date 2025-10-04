'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FarmerRanking,
  FarmerLevel,
  AVAILABLE_BADGES,
} from '@/types/farmer-ranking'
import {
  Trophy,
  TrendingUp,
  Award,
  MapPin,
  Calendar,
  Sprout,
  Droplet,
  Bug,
  Leaf,
  CloudRain,
  BarChart3,
} from 'lucide-react'

export default function FarmerRankingsPage() {
  const [rankings, setRankings] = useState<FarmerRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | FarmerLevel>('all')
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalContributions: 0,
    avgPoints: 0,
  })

  useEffect(() => {
    fetchRankings()
  }, [filter])

  const fetchRankings = async () => {
    try {
      setLoading(true)
      const url =
        filter === 'all'
          ? '/api/rankings?limit=100'
          : `/api/rankings?limit=100&level=${filter}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setRankings(result.data)

        // Calcular estadísticas
        const totalFarmers = result.data.length
        const totalContributions = result.data.reduce(
          (sum: number, farmer: FarmerRanking) =>
            sum + farmer.contributions_count,
          0
        )
        const avgPoints =
          totalFarmers > 0
            ? Math.round(
                result.data.reduce(
                  (sum: number, farmer: FarmerRanking) =>
                    sum + farmer.total_points,
                  0
                ) / totalFarmers
              )
            : 0

        setStats({ totalFarmers, totalContributions, avgPoints })
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: FarmerLevel) => {
    const colors: Record<FarmerLevel, string> = {
      Aprendiz: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
      Cultivador:
        'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      'Agricultor Experimentado':
        'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      'Maestro Agricultor':
        'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      'Gran Maestro':
        'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
      'Leyenda del Campo':
        'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    }
    return colors[level] || colors['Aprendiz']
  }

  const getRankMedal = (position: number) => {
    if (position === 1) return { icon: '🥇', color: 'text-yellow-500' }
    if (position === 2) return { icon: '🥈', color: 'text-gray-400' }
    if (position === 3) return { icon: '🥉', color: 'text-orange-500' }
    return { icon: `#${position}`, color: 'text-gray-500' }
  }

  const getBadgeIcon = (badgeId: string) => {
    const badge = AVAILABLE_BADGES.find((b) => b.id === badgeId)
    return badge?.icon || '🏅'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            <span>Ranking Nacional de Agricultores</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Top de Contribuyentes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Reconocemos a los agricultores que comparten datos valiosos sobre
            sequías, plagas y prácticas sostenibles. ¡Tu contribución puede
            mejorar contratos y licitaciones gubernamentales!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Agricultores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFarmers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Contribuciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalContributions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Puntos Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgPoints}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filtrar por Nivel
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {(
              [
                'Aprendiz',
                'Cultivador',
                'Agricultor Experimentado',
                'Maestro Agricultor',
                'Gran Maestro',
                'Leyenda del Campo',
              ] as FarmerLevel[]
            ).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === level
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Cargando rankings...
            </p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay agricultores en este nivel
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sé el primero en contribuir y alcanzar este nivel
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((farmer) => {
              const medal = getRankMedal(farmer.rank_position)
              return (
                <div
                  key={farmer.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start space-x-4">
                    {/* Rank Position */}
                    <div className="flex-shrink-0">
                      <div className={`text-4xl font-bold ${medal.color}`}>
                        {medal.icon}
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {farmer.farmer_name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            {farmer.location && (
                              <>
                                <MapPin className="h-4 w-4" />
                                <span>{farmer.location}</span>
                                <span>•</span>
                              </>
                            )}
                            <Calendar className="h-4 w-4" />
                            <span>
                              Desde{' '}
                              {new Date(farmer.created_at).toLocaleDateString(
                                'es-MX',
                                { month: 'long', year: 'numeric' }
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(
                              farmer.level
                            )}`}
                          >
                            {farmer.level}
                          </div>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {farmer.total_points.toLocaleString()} pts
                          </p>
                        </div>
                      </div>

                      {/* Contribution Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <Droplet className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Sequías
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {farmer.drought_reports}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Plagas
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {farmer.pest_reports}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Sostenible
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {farmer.sustainable_practices}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <CloudRain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Clima
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {farmer.weather_data_shared}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Total
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {farmer.contributions_count}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {farmer.badges &&
                        Array.isArray(farmer.badges) &&
                        farmer.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {farmer.badges.map(
                              (badgeId: string, index: number) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-xs font-medium text-yellow-700 dark:text-yellow-400"
                                  title={
                                    AVAILABLE_BADGES.find(
                                      (b) => b.id === badgeId
                                    )?.description
                                  }
                                >
                                  <span>{getBadgeIcon(badgeId)}</span>
                                  <span>
                                    {
                                      AVAILABLE_BADGES.find(
                                        (b) => b.id === badgeId
                                      )?.name
                                    }
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            ¿Quieres aparecer en el ranking?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Únete a BloomWatch y comparte información valiosa para la comunidad
            agrícola. Obtén mejores contratos y reconocimiento por tus
            contribuciones.
          </p>
          <Link
            href="/auth/register?role=agricultor"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            <Trophy className="h-5 w-5" />
            <span>Unirse Ahora</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
