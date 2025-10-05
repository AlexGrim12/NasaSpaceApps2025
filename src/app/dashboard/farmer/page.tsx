'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  MapPin,
  Thermometer,
  Droplet,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Award,
  Plus,
  Leaf,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FarmerRanking } from '@/types/farmer-ranking'

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [ranking, setRanking] = useState<FarmerRanking | null>(null)

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

  const fetchRanking = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/rankings/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setRanking(data.data)
      }
    } catch (error) {
      console.error('Error fetching ranking:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRanking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
            Welcome, {profile.name}! 🌾
          </h1>
          <p className="text-muted-foreground">
            Control panel for corn crop monitoring
          </p>
        </div>

        {/* Ranking CTA */}
        {ranking && (
          <div className="mb-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="h-12 w-12 text-yellow-300" />
                <div>
                  <h3 className="text-2xl font-bold">
                    Position #{ranking.rank_position || '-'} in Rankings
                  </h3>
                  <p className="text-white/80">
                    {ranking.total_points} points • Level:{' '}
                    <span className="capitalize font-semibold">
                      {ranking.level}
                    </span>
                  </p>
                </div>
              </div>
              <Link
                href="/contributions"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Contribution</span>
              </Link>
            </div>
          </div>
        )}

        {!ranking && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="h-12 w-12 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold">
                    Join the Farmer Rankings!
                  </h3>
                  <p className="text-muted-foreground">
                    Share information and earn points to improve your position
                  </p>
                </div>
              </div>
              <Link
                href="/contributions"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Contribution</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Active Fields
              </h3>
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-sm text-muted-foreground">
              +2 since last month
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Average Temperature
              </h3>
              <Thermometer className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">24°C</div>
            <p className="text-sm text-muted-foreground">
              Optimal for blooming
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Soil Moisture
              </h3>
              <Droplet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <p className="text-sm text-muted-foreground">Adequate level</p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                Next Blooming
              </h3>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">15 days</div>
            <p className="text-sm text-muted-foreground">North Field</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Blooming detected in South Field
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Satellite image updated
                  </p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Irrigation recommendation sent
                  </p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alerts and Recommendations
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Possible water stress
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  The East field shows signs of needing irrigation in the
                  next 2-3 days.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Optimal conditions for blooming
                </p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  North and Central fields show ideal conditions for
                  blooming.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  New image available
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Check out the new MODIS satellite images for detailed
                  analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                🌸 Bloom Prediction with AI
              </h3>
              <p className="text-muted-foreground">
                Phenological analysis system using Machine Learning (LSTM) and
                NASA satellite data
              </p>
            </div>
            <Link
              href="/dashboard/farmer/bloom-prediction"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <Leaf className="h-5 w-5" />
              <span>Access Now</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Save Your Fields</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Register GPS coordinates of your land for accurate
                analysis
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Accurate Predictions</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get blooming dates using real-time satellite
                data
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Complete Timeline</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                View day-by-day probabilities throughout the entire
                season
              </p>
            </div>
          </div>
        </div>

        {/* Próximamente */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">🚀 Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4">
              <h4 className="font-semibold mb-2">Interactive Maps</h4>
              <p className="text-sm text-muted-foreground">
                Visualize your fields on satellite maps
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Historical Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Compare predictions with actual results
              </p>
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Mobile Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Receive alerts on your device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
