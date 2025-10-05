'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  Droplets,
  Bug,
  Leaf,
  BarChart3,
  Cloud,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { ContributionType, CONTRIBUTION_POINTS } from '@/types/farmer-ranking'

interface ContributionFormProps {
  onSuccess?: () => void
}

const CONTRIBUTION_TYPES: {
  value: ContributionType
  label: string
  description: string
  icon: React.ReactNode
  color: string
  points: number
}[] = [
  {
    value: 'drought_report',
    label: 'Drought Report',
    description: 'Report drought conditions in your region',
    icon: <Droplets className="h-5 w-5" />,
    color: 'text-orange-600',
    points: CONTRIBUTION_POINTS.drought_report,
  },
  {
    value: 'pest_report',
    label: 'Pest Report',
    description: 'Report detected pests or diseases',
    icon: <Bug className="h-5 w-5" />,
    color: 'text-red-600',
    points: CONTRIBUTION_POINTS.pest_report,
  },
  {
    value: 'sustainable_practice',
    label: 'Sustainable Practice',
    description: 'Share your sustainable agricultural practices',
    icon: <Leaf className="h-5 w-5" />,
    color: 'text-green-600',
    points: CONTRIBUTION_POINTS.sustainable_practice,
  },
  {
    value: 'crop_data',
    label: 'Crop Data',
    description: 'Share information about your harvest and planting',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-blue-600',
    points: CONTRIBUTION_POINTS.crop_data,
  },
  {
    value: 'weather_data',
    label: 'Weather Data',
    description: 'Contribute meteorological data from your location',
    icon: <Cloud className="h-5 w-5" />,
    color: 'text-purple-600',
    points: CONTRIBUTION_POINTS.weather_data,
  },
]

export default function ContributionForm({ onSuccess }: ContributionFormProps) {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<ContributionType | ''>('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'high'>(
    'moderate'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!user) {
      setError('You must sign in to contribute')
      return
    }

    if (!selectedType) {
      setError('Select a contribution type')
      return
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      // Obtener el token de sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError('Your session has expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: selectedType,
          description,
          metadata: {
            location,
            severity: ['drought_report', 'pest_report'].includes(selectedType)
              ? severity
              : undefined,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creating contribution')
      }

      setSuccess(true)
      setDescription('')
      setLocation('')
      setSeverity('moderate')
      setSelectedType('')

      if (onSuccess) {
        onSuccess()
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const selectedContribution = CONTRIBUTION_TYPES.find(
    (t) => t.value === selectedType
  )

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">📊 New Contribution</h2>
      <p className="text-muted-foreground mb-6">
        Share valuable information and earn points to improve your ranking
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Contribution Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTRIBUTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedType === type.value
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={type.color}>{type.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </div>
                    <div className="text-xs font-medium text-green-600 mt-2">
                      +{type.points} points
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Type Details */}
        {selectedContribution && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className={selectedContribution.color}>
                {selectedContribution.icon}
              </div>
              <span className="font-semibold">
                {selectedContribution.label}
              </span>
              <span className="ml-auto text-green-600 font-bold">
                +{selectedContribution.points} points
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Detailed Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your contribution in as much detail as possible. Include dates, specific locations, quantities, varieties, techniques used, results obtained, etc."
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-background"
            required
            minLength={10}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 10 characters. Currently: {description.length}
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location (optional)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="E.g: Jalisco, Tepatitlán - North Field"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-background"
          />
        </div>

        {/* Severity (for drought and pest reports) */}
        {selectedType &&
          ['drought_report', 'pest_report'].includes(selectedType) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Severity
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSeverity('low')}
                  className={`py-2 px-4 border-2 rounded-lg font-medium transition-all ${
                    severity === 'low'
                      ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('moderate')}
                  className={`py-2 px-4 border-2 rounded-lg font-medium transition-all ${
                    severity === 'moderate'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  Moderate
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('high')}
                  className={`py-2 px-4 border-2 rounded-lg font-medium transition-all ${
                    severity === 'high'
                      ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  High
                </button>
              </div>
            </div>
          )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-400">
              {error}
            </span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Contribution created successfully! Pending verification.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedType || description.length < 10}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Submit Contribution</span>
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          * Required fields. Your contribution will be reviewed by our
          team before being verified and adding points to your ranking.
        </p>
      </form>
    </div>
  )
}
