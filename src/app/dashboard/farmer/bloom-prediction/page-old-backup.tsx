'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  MapPin,
  Calendar,
  TrendingUp,
  Thermometer,
  Leaf,
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  Eye,
  Plus,
  ChevronUp,
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface FarmLocation {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  hectares?: number
  crop_variety?: string
  planting_date?: string
  created_at: string
}

interface BloomPrediction {
  fecha_actual: string
  fecha_floracion_predicha: string
  dias_hasta_floracion: number
  gdc_acumulado: number
  ndvi_actual?: number
  confianza?: number
  temperatura_media?: number[]
  precipitacion_mm?: number[]
  fechas?: string[]
}

interface TimelineData {
  fecha_pico_probabilidad: string
  probabilidad_maxima: number
  timeline: Array<{
    fecha: string
    probabilidad: number
    gdc_proyectado: number
  }>
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BloomPredictionPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  // Estados principales
  const [locations, setLocations] = useState<FarmLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<FarmLocation | null>(
    null
  )
  const [showNewLocationForm, setShowNewLocationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados de predicción
  const [prediction, setPrediction] = useState<BloomPrediction | null>(null)
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [activeTab, setActiveTab] = useState<
    'prediction' | 'timeline' | 'history'
  >('prediction')

  // Estados del formulario de nueva ubicación
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    hectares: '',
    crop_variety: '',
    planting_date: '',
  })

  // Estados para predicción
  const [predictionParams, setPredictionParams] = useState({
    fecha_actual: new Date().toISOString().split('T')[0],
    año_actual: new Date().getFullYear(),
    dias_historia: 30,
    dia_inicio_cultivo: '05-15',
  })

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (profile?.role !== 'agricultor') {
        router.push('/dashboard/researcher')
        return
      }
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchLocations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ============================================
  // FUNCIONES DE API
  // ============================================

  // Función helper para obtener el token
  const getAuthToken = async () => {
    const session = await supabase.auth.getSession()
    return session.data.session?.access_token
  }

  const fetchLocations = async () => {
    try {
      const token = await getAuthToken()
      if (!token) return

      const response = await fetch('/api/farm-locations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLocations(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }

  const saveNewLocation = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('No autenticado')
        return
      }

      const response = await fetch('/api/farm-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newLocation,
          latitude: parseFloat(newLocation.latitude),
          longitude: parseFloat(newLocation.longitude),
          hectares: newLocation.hectares
            ? parseFloat(newLocation.hectares)
            : null,
        }),
      })

      if (response.ok) {
        setSuccess('✅ Ubicación guardada exitosamente')
        setNewLocation({
          name: '',
          description: '',
          latitude: '',
          longitude: '',
          hectares: '',
          crop_variety: '',
          planting_date: '',
        })
        setShowNewLocationForm(false)
        fetchLocations()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar ubicación')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return

    try {
      const token = await getAuthToken()
      if (!token) return

      const response = await fetch(`/api/farm-locations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess('✅ Ubicación eliminada')
        fetchLocations()
        if (selectedLocation?.id === id) {
          setSelectedLocation(null)
          setPrediction(null)
          setTimeline(null)
        }
      }
    } catch (err) {
      setError('Error al eliminar ubicación')
      console.error(err)
    }
  }

  const runPrediction = async () => {
    if (!selectedLocation) {
      setError('Selecciona una ubicación primero')
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)

    const API_URL =
      process.env.NEXT_PUBLIC_BLOOM_API_URL || 'http://localhost:8000'

    try {
      const response = await fetch(`${API_URL}/predecir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitud: selectedLocation.latitude,
          longitud: selectedLocation.longitude,
          ...predictionParams,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPrediction(data)
        setSuccess('✅ Predicción realizada exitosamente')

        // Guardar predicción en base de datos
        await savePredictionToDatabase(data)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Error en la predicción')
      }
    } catch (err) {
      setError('Error de conexión con el servicio de predicción')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const runTimeline = async () => {
    if (!selectedLocation) {
      setError('Selecciona una ubicación primero')
      return
    }

    setLoading(true)
    setError(null)
    setTimeline(null)

    const API_URL =
      process.env.NEXT_PUBLIC_BLOOM_API_URL || 'http://localhost:8000'

    try {
      const response = await fetch(`${API_URL}/timeline-floracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitud: selectedLocation.latitude,
          longitud: selectedLocation.longitude,
          año: predictionParams.año_actual,
          dia_inicio_cultivo: predictionParams.dia_inicio_cultivo,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTimeline(data)
        setSuccess('✅ Timeline generado exitosamente')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Error al generar timeline')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const savePredictionToDatabase = async (predictionData: BloomPrediction) => {
    if (!selectedLocation || !user) return

    try {
      const token = await getAuthToken()
      if (!token) return

      await fetch('/api/bloom-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location_id: selectedLocation.id,
          analysis_date: predictionData.fecha_actual,
          predicted_bloom_date: predictionData.fecha_floracion_predicha,
          days_to_bloom: predictionData.dias_hasta_floracion,
          gdc_accumulated: predictionData.gdc_acumulado,
          ndvi_value: predictionData.ndvi_actual,
          confidence_score: predictionData.confianza
            ? predictionData.confianza * 100
            : null,
        }),
      })
    } catch (err) {
      console.error('Error saving prediction:', err)
    }
  }

  // ============================================
  // COORDENADAS PREDEFINIDAS
  // ============================================

  const presetCoordinates = [
    { name: '🇲🇽 México Central', lat: 19.2, lon: -99.4 },
    { name: '🇲🇽 Jalisco', lat: 20.6736, lon: -103.3444 },
    { name: '🇲🇽 Sinaloa', lat: 25.8, lon: -108.5 },
    { name: '🇦🇷 Argentina', lat: -38.0, lon: -57.5 },
  ]

  const setPresetCoords = (lat: number, lon: number) => {
    setNewLocation((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lon.toString(),
    }))
  }

  // ============================================
  // RENDER CONDICIONAL
  // ============================================

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-600" />
            🌸 Predicción de Floración
          </h1>
          <p className="text-muted-foreground">
            Sistema de análisis fenológico con Machine Learning (LSTM + Datos
            Satelitales NASA)
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Ubicaciones */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Mis Parcelas
                </h2>
                <button
                  onClick={() => setShowNewLocationForm(!showNewLocationForm)}
                  className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  {showNewLocationForm ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5 text-green-600" />
                  )}
                </button>
              </div>

              {/* Formulario Nueva Ubicación */}
              {showNewLocationForm && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm mb-3">Nueva Parcela</h3>

                  {/* Coordenadas Predefinidas */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {presetCoordinates.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setPresetCoords(preset.lat, preset.lon)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Nombre (ej: Parcela Norte)"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitud"
                    value={newLocation.latitude}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        latitude: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitud"
                    value={newLocation.longitude}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        longitude: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Hectáreas (opcional)"
                    value={newLocation.hectares}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        hectares: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={saveNewLocation}
                    disabled={
                      loading ||
                      !newLocation.name ||
                      !newLocation.latitude ||
                      !newLocation.longitude
                    }
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar Ubicación
                  </button>
                </div>
              )}

              {/* Lista de Ubicaciones */}
              <div className="space-y-2">
                {locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tienes parcelas guardadas. <br />
                    Agrega una nueva ubicación arriba.
                  </p>
                ) : (
                  locations.map((loc) => (
                    <div
                      key={loc.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedLocation?.id === loc.id
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div
                        onClick={() => setSelectedLocation(loc)}
                        className="flex-1"
                      >
                        <h3 className="font-semibold text-sm">{loc.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}
                          °
                        </p>
                        {loc.hectares && (
                          <p className="text-xs text-muted-foreground">
                            {loc.hectares} hectáreas
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLocation(loc)
                          }}
                          className="flex-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Analizar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLocation(loc.id)
                          }}
                          className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Predicción */}
          <div className="lg:col-span-2">
            {!selectedLocation ? (
              <div className="bg-card border rounded-lg p-12 text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Selecciona una Parcela
                </h3>
                <p className="text-muted-foreground">
                  Elige una ubicación de la lista o agrega una nueva para
                  comenzar el análisis
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info de Ubicación Seleccionada */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedLocation.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="opacity-80">Coordenadas</p>
                      <p className="font-semibold">
                        {selectedLocation.latitude.toFixed(4)}°,{' '}
                        {selectedLocation.longitude.toFixed(4)}°
                      </p>
                    </div>
                    {selectedLocation.hectares && (
                      <div>
                        <p className="opacity-80">Superficie</p>
                        <p className="font-semibold">
                          {selectedLocation.hectares} ha
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setActiveTab('prediction')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'prediction'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🔮 Predicción
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'timeline'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📊 Timeline
                  </button>
                </div>

                {/* Tab Content - Predicción */}
                {activeTab === 'prediction' && (
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Parámetros de Predicción
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Fecha Actual
                        </label>
                        <input
                          type="date"
                          value={predictionParams.fecha_actual}
                          onChange={(e) =>
                            setPredictionParams({
                              ...predictionParams,
                              fecha_actual: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Año de Temporada
                        </label>
                        <input
                          type="number"
                          min="2018"
                          max="2030"
                          value={predictionParams.año_actual}
                          onChange={(e) =>
                            setPredictionParams({
                              ...predictionParams,
                              año_actual: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      onClick={runPrediction}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5" />
                          Ejecutar Predicción
                        </>
                      )}
                    </button>

                    {/* Resultados de Predicción */}
                    {prediction && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">
                          ✅ Resultados de la Predicción
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium">
                                Fecha Predicha
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {new Date(
                                prediction.fecha_floracion_predicha
                              ).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'long',
                              })}
                            </p>
                          </div>

                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium">
                                Días Restantes
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                              {prediction.dias_hasta_floracion} días
                            </p>
                          </div>

                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Thermometer className="h-5 w-5 text-orange-600" />
                              <span className="text-sm font-medium">
                                GDC Acumulado
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">
                              {prediction.gdc_acumulado.toFixed(1)}
                            </p>
                          </div>

                          {prediction.ndvi_actual && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Leaf className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium">
                                  NDVI Actual
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-purple-600">
                                {prediction.ndvi_actual.toFixed(3)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content - Timeline */}
                {activeTab === 'timeline' && (
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Timeline de Floración
                    </h3>

                    <button
                      onClick={runTimeline}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold mb-6"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5" />
                          Generar Timeline
                        </>
                      )}
                    </button>

                    {/* Resultados Timeline */}
                    {timeline && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                          <h4 className="font-semibold mb-2">
                            📅 Fecha con Mayor Probabilidad
                          </h4>
                          <p className="text-2xl font-bold text-blue-600">
                            {new Date(
                              timeline.fecha_pico_probabilidad
                            ).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Probabilidad:{' '}
                            {timeline.probabilidad_maxima.toFixed(1)}%
                          </p>
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-2">
                          <h4 className="font-semibold sticky top-0 bg-card py-2">
                            Top 10 Fechas Más Probables
                          </h4>
                          {timeline.timeline
                            .sort((a, b) => b.probabilidad - a.probabilidad)
                            .slice(0, 10)
                            .map((day, idx) => (
                              <div
                                key={day.fecha}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-gray-400">
                                    #{idx + 1}
                                  </span>
                                  <div>
                                    <p className="font-medium">
                                      {new Date(day.fecha).toLocaleDateString(
                                        'es-MX',
                                        {
                                          day: 'numeric',
                                          month: 'short',
                                        }
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      GDC: {day.gdc_proyectado.toFixed(1)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-lg font-bold ${
                                      day.probabilidad > 75
                                        ? 'text-green-600'
                                        : day.probabilidad > 50
                                        ? 'text-yellow-600'
                                        : 'text-orange-600'
                                    }`}
                                  >
                                    {day.probabilidad.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            ℹ️ Información del Sistema
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">🎯 Características:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Modelo LSTM (Long Short-Term Memory)</li>
                <li>9 variables ambientales</li>
                <li>Datos de NASA POWER API</li>
                <li>NDVI de Sentinel-2</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">📊 Variables Analizadas:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>GDC (Growing Degree Days)</li>
                <li>Índice de Vegetación (NDVI)</li>
                <li>Precipitación acumulada</li>
                <li>Temperatura media, máx y mín</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
