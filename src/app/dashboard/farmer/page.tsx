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
  Satellite,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FarmerRanking } from '@/types/farmer-ranking'
import { supabase } from '@/lib/supabase'

interface FarmLocation {
  id: string
  farmer_id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  hectares: number | null
  crop_variety: string | null
  planting_date: string | null
  created_at: string
}

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [ranking, setRanking] = useState<FarmerRanking | null>(null)
  const [locations, setLocations] = useState<FarmLocation[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [earthdataUrl, setEarthdataUrl] = useState<string>('')

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

  const fetchLocations = async () => {
    if (!user) return
    try {
      // Obtener el token de sesión
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        console.error('No access token available')
        return
      }

      const res = await fetch('/api/farm-locations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setLocations(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const generateEarthdataUrl = (
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string,
    zoom: number = 17
  ): string => {
    // Redondear coordenadas a 3 decimales
    const lat = parseFloat(latitude.toFixed(3))
    const lon = parseFloat(longitude.toFixed(3))
    
    const startDatetime = `${startDate}T00%3A00%3A00.000Z`
    const endDatetime = `${endDate}T23%3A59%3A59.999Z`

    const baseUrl = 'https://search.earthdata.nasa.gov/search/granules'
    const params =
      `?p=C2021957295-LPCLOUD` +
      `&pg[0][v]=f` +
      `&pg[0][gsk]=-start_date` +
      `&q=C2021957657-LPCLOUD` +
      `&sp[0]=${lon}%2C${lat}` +
      `&qt=${startDatetime}%2C${endDatetime}` +
      `&tl=1562640103.056!5!!` +
      `&lat=${lat}` +
      `&long=${lon}` +
      `&zoom=${zoom}`

    return baseUrl + params
  }

  const handleGenerateUrl = () => {
    if (!selectedLocationId || !startDate || !endDate) {
      alert('Please select a field and both dates')
      return
    }

    const selectedLocation = locations.find((loc) => loc.id === selectedLocationId)
    if (!selectedLocation) {
      alert('Field not found')
      return
    }

    const url = generateEarthdataUrl(
      selectedLocation.latitude,
      selectedLocation.longitude,
      startDate,
      endDate
    )
    setEarthdataUrl(url)
  }

  useEffect(() => {
    if (user) {
      fetchRanking()
      fetchLocations()
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
            <p className="text-sm text-muted-foreground">+2 since last month</p>
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

        {/* NASA Satellite Images Section */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Satellite className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🛰️ NASA Satellite Images
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View Landsat satellite imagery for your fields
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Field
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- Select a field --</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.hectares} ha)
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerateUrl}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Satellite className="h-5 w-5" />
              Generate NASA Earthdata Link
            </button>
          </div>

          {/* Generated URL Display */}
          {earthdataUrl && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-300 dark:border-blue-600">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🎉 Link generated successfully!
                  </p>
                  {selectedLocationId && locations.find(loc => loc.id === selectedLocationId) && (
                    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        📍 <strong>Coordinates (rounded to 3 decimals):</strong>
                        <br />
                        Latitude: {locations.find(loc => loc.id === selectedLocationId)!.latitude.toFixed(3)}°
                        {' | '}
                        Longitude: {locations.find(loc => loc.id === selectedLocationId)!.longitude.toFixed(3)}°
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all mb-3">
                    {earthdataUrl}
                  </p>
                  <a
                    href={earthdataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open NASA Earthdata
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>ℹ️ How to use:</strong> Select one of your registered
              fields, choose a date range, and click the button to generate a
              direct link to NASA Earthdata. You&apos;ll be able to view and
              download Landsat satellite images for your field location.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              📐 <strong>Note:</strong> Coordinates are automatically rounded to 3 decimal places for optimal precision (~111 meters).
            </p>
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
                  The East field shows signs of needing irrigation in the next
                  2-3 days.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Optimal conditions for blooming
                </p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  North and Central fields show ideal conditions for blooming.
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
                Register GPS coordinates of your land for accurate analysis
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Accurate Predictions</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get blooming dates using real-time satellite data
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Complete Timeline</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                View day-by-day probabilities throughout the entire season
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
