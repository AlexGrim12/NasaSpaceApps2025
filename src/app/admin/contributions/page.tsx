'use client'

// =====================================================
// PANEL DE ADMINISTRADOR - Verificación de Contribuciones
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { Contribution } from '@/types/farmer-ranking'

interface FarmerInfo {
  name: string
  email: string
  location?: string
}

interface ContributionWithFarmer extends Contribution {
  farmer_info?: FarmerInfo
}

export default function AdminContributionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<ContributionWithFarmer[]>(
    []
  )
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContribution, setSelectedContribution] =
    useState<ContributionWithFarmer | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Verificar permisos de admin
  const checkAdminPermissions = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    const adminStatus = await isAdmin(user)
    if (!adminStatus) {
      router.push('/dashboard/farmer')
      return
    }

    setIsAdminUser(true)
  }

  useEffect(() => {
    if (!authLoading) {
      checkAdminPermissions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const fetchContributions = async () => {
    try {
      setLoading(true)

      // Construir URL con filtros
      let url = '/api/contributions?'
      if (filter === 'pending') {
        url += 'verified=false'
      } else if (filter === 'verified') {
        url += 'verified=true'
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        // Enrich with farmer information
        const enrichedContributions = await Promise.all(
          result.data.map(async (contrib: Contribution) => {
            try {
              const { data: ranking } = await supabase
                .from('farmer_rankings')
                .select('farmer_name, location')
                .eq('farmer_id', contrib.farmer_id)
                .single()

              const { data: userData } = await supabase.auth.admin.getUserById(
                contrib.farmer_id
              )

              return {
                ...contrib,
                farmer_info: {
                  name: ranking?.farmer_name || 'Farmer',
                  email: userData?.user?.email || 'No email',
                  location: ranking?.location,
                },
              }
            } catch (error) {
              console.error('Error fetching farmer info:', error)
              return contrib
            }
          })
        )

        setContributions(enrichedContributions)
      }
    } catch (error) {
      console.error('Error fetching contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdminUser) {
      fetchContributions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isAdminUser])

  const handleVerify = async (contributionId: string, verified: boolean) => {
    try {
      setProcessingId(contributionId)

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const response = await fetch(
        `/api/admin/contributions/${contributionId}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verified,
            notes: verified ? 'Approved by administrator' : 'Rejected',
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        // Actualizar lista
        await fetchContributions()
        setSelectedContribution(null)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error verifying contribution:', error)
      alert('Error al procesar la verificación')
    } finally {
      setProcessingId(null)
    }
  }

  // Filtrar por búsqueda
  const filteredContributions = contributions.filter((c) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      c.farmer_info?.name.toLowerCase().includes(search) ||
      c.farmer_info?.email.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.type.toLowerCase().includes(search)
    )
  })

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      drought_report: 'Drought Report',
      pest_report: 'Pest Report',
      sustainable_practice: 'Sustainable Practice',
      crop_data: 'Crop Data',
      weather_data: 'Weather Data',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      drought_report: 'bg-red-500/10 text-red-500',
      pest_report: 'bg-orange-500/10 text-orange-500',
      sustainable_practice: 'bg-green-500/10 text-green-500',
      crop_data: 'bg-blue-500/10 text-blue-500',
      weather_data: 'bg-purple-500/10 text-purple-500',
    }
    return colors[type] || 'bg-gray-500/10 text-gray-500'
  }

  if (authLoading || !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Farmer contributions verification
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    {contributions.filter((c) => !c.verified).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Verified
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {contributions.filter((c) => c.verified).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {contributions.length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'pending'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('verified')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'verified'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Verified
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No contributions found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                            contribution.type
                          )}`}
                        >
                          {getTypeLabel(contribution.type)}
                        </span>
                        {contribution.verified ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        +{contribution.points_earned} pts
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {contribution.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{contribution.farmer_info?.name}</span>
                      </div>
                      {contribution.farmer_info?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{contribution.farmer_info.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(contribution.created_at).toLocaleDateString(
                            'en-US'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    <button
                      onClick={() => setSelectedContribution(contribution)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {!contribution.verified ? (
                      <>
                        <button
                          onClick={() =>
                            handleVerify(contribution.id, true)
                          }
                          disabled={processingId === contribution.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleVerify(contribution.id, false)
                          }
                          disabled={processingId === contribution.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          handleVerify(contribution.id, false)
                        }
                        disabled={processingId === contribution.id}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalles */}
        {selectedContribution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contribution Details
                </h2>
                <button
                  onClick={() => setSelectedContribution(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Type
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {getTypeLabel(selectedContribution.type)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Farmer
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedContribution.farmer_info?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedContribution.farmer_info?.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedContribution.description}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedContribution.points_earned} points
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <p
                    className={`font-medium ${
                      selectedContribution.verified
                        ? 'text-green-500'
                        : 'text-orange-500'
                    }`}
                  >
                    {selectedContribution.verified
                      ? 'Verified'
                      : 'Pending'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Creation Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(
                      selectedContribution.created_at
                    ).toLocaleString('en-US')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {!selectedContribution.verified ? (
                  <>
                    <button
                      onClick={() => {
                        handleVerify(selectedContribution.id, true)
                        setSelectedContribution(null)
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleVerify(selectedContribution.id, false)
                        setSelectedContribution(null)
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleVerify(selectedContribution.id, false)
                      setSelectedContribution(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
