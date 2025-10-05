'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ContributionForm from '@/components/ContributionForm'
import FarmerStats from '@/components/FarmerStats'
import { Award } from 'lucide-react'

export default function ContributionsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

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
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) return null

  const handleSuccess = () => {
    // Refresh stats after successful contribution
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Award className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">
              My Contributions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Share valuable information, earn points and climb the rankings
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border rounded-lg p-6">
          <h3 className="font-semibold mb-2">
            💡 How does the points system work?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium text-orange-600">Droughts:</span> 50
              pts
            </div>
            <div>
              <span className="font-medium text-red-600">Pests:</span> 40 pts
            </div>
            <div>
              <span className="font-medium text-green-600">Sustainable:</span>{' '}
              60 pts
            </div>
            <div>
              <span className="font-medium text-blue-600">Crop:</span> 30 pts
            </div>
            <div>
              <span className="font-medium text-purple-600">Weather:</span> 20
              pts
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All contributions are reviewed before being verified. Points are
            automatically added once verified.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <ContributionForm onSuccess={handleSuccess} />
          </div>

          {/* Right Column - Stats */}
          <div key={refreshKey}>
            <FarmerStats />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            🏆 Benefits of Contributing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold mb-2">Better Contracts</h4>
              <p className="text-sm text-muted-foreground">
                Highly ranked farmers get access to better government tenders
                and commercial contracts
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-semibold mb-2">Recognition</h4>
              <p className="text-sm text-muted-foreground">
                Level up from Apprentice to Legend and get exclusive badges that
                demonstrate your expertise
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌍</div>
              <h4 className="font-semibold mb-2">Social Impact</h4>
              <p className="text-sm text-muted-foreground">
                Your information helps other farmers and contributes to
                Mexico&apos;s food security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
