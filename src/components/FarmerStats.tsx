'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Trophy,
  TrendingUp,
  Award,
  Droplets,
  Bug,
  Leaf,
  BarChart3,
  Cloud,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { FarmerRanking, Contribution } from '@/types/farmer-ranking'

const CONTRIBUTION_ICONS: Record<string, React.ReactNode> = {
  drought_report: <Droplets className="h-4 w-4" />,
  pest_report: <Bug className="h-4 w-4" />,
  sustainable_practice: <Leaf className="h-4 w-4" />,
  crop_data: <BarChart3 className="h-4 w-4" />,
  weather_data: <Cloud className="h-4 w-4" />,
}

const CONTRIBUTION_COLORS: Record<string, string> = {
  drought_report: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  pest_report: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  sustainable_practice: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  crop_data: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  weather_data: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
}

const CONTRIBUTION_LABELS: Record<string, string> = {
  drought_report: 'Drought',
  pest_report: 'Pest',
  sustainable_practice: 'Sustainable',
  crop_data: 'Crop',
  weather_data: 'Weather',
}

export default function FarmerStats() {
  const { user, profile } = useAuth()
  const [ranking, setRanking] = useState<FarmerRanking | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch ranking
      const rankingRes = await fetch(`/api/rankings/${user.id}`)
      if (rankingRes.ok) {
        const rankingData = await rankingRes.json()
        setRanking(rankingData.data)
      }

      // Fetch contributions
      const contributionsRes = await fetch(
        `/api/contributions?farmerId=${user.id}`
      )
      if (contributionsRes.ok) {
        const contributionsData = await contributionsRes.json()
        setContributions(contributionsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const filteredContributions = contributions.filter((c) => {
    if (filter === 'verified') return c.verified
    if (filter === 'pending') return !c.verified
    return true
  })

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your stats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ranking Stats */}
      {ranking && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">
                {profile?.name || 'Farmer'}
              </h3>
              <p className="text-white/80">Your ranking position</p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-300" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {ranking.rank_position || '-'}
              </div>
              <div className="text-sm text-white/80">Position</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{ranking.total_points}</div>
              <div className="text-sm text-white/80">Points</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold capitalize">
                {ranking.level}
              </div>
              <div className="text-sm text-white/80">Level</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {ranking.contributions_count}
              </div>
              <div className="text-sm text-white/80">Contributions</div>
            </div>
          </div>

          {ranking.badges && ranking.badges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Unlocked Badges</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ranking.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contributions Breakdown */}
      {ranking && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Contributions Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Droplets className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {ranking.drought_reports}
              </div>
              <div className="text-xs text-muted-foreground">Droughts</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Bug className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {ranking.pest_reports}
              </div>
              <div className="text-xs text-muted-foreground">Pests</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Leaf className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {ranking.sustainable_practices}
              </div>
              <div className="text-xs text-muted-foreground">Sustainable</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {ranking.crop_data_shared}
              </div>
              <div className="text-xs text-muted-foreground">Crops</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Cloud className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {ranking.weather_data_shared}
              </div>
              <div className="text-xs text-muted-foreground">Weather</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Contributions */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">My Contributions</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              All ({contributions.length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'verified'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Verified ({contributions.filter((c) => c.verified).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Pending ({contributions.filter((c) => !c.verified).length})
            </button>
          </div>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'You don\'t have any contributions yet. Create your first contribution above!'
                : filter === 'verified'
                ? 'You don\'t have verified contributions yet.'
                : 'You don\'t have pending contributions.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredContributions.map((contribution) => (
              <div
                key={contribution.id}
                className={`p-4 border rounded-lg ${
                  contribution.verified
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        CONTRIBUTION_COLORS[contribution.type]
                      }`}
                    >
                      {CONTRIBUTION_ICONS[contribution.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">
                          {CONTRIBUTION_LABELS[contribution.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          +{contribution.points_earned} pts
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {contribution.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(contribution.created_at).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        {contribution.verified ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
