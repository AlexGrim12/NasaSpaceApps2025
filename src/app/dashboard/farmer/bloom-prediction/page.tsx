'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  savePredictionWithAnalysis,
  uploadSatelliteImage,
  getRecentPrediction,
  type BloomPredictionData,
  type AnalysisData,
  type SatelliteImageData,
  type CompletePrediction,
  type SavedAnalysis,
} from '@/lib/bloom-predictions'
import {
  MapPin,
  Plus,
  X,
  Leaf,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Calendar,
  Thermometer,
  Droplets,
  Activity,
  Image as ImageIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Import Map dynamically to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
    </div>
  ),
})

// Import Chart.js dynamically to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
})
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
})

// Registrar componentes de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ============================================
// TIPOS
// ============================================

interface Location {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  hectares: number | null
  crop_variety: string | null
  planting_date: string | null
  created_at: string
}

interface TrainResult {
  mensaje: string
  metricas?: {
    mae: number
    rmse: number
  }
  mejor_epoca?: number
  ruta_modelo?: string
  grafica_metricas?: {
    epocas: number[]
    loss_train: number[]
    loss_val: number[]
    mae_train: number[]
    mae_val: number[]
  }
}

interface TimelineResult {
  fecha_pico_probabilidad: string
  probabilidad_maxima: number
  timeline: Array<{
    fecha: string
    probabilidad: number
    gdc_proyectado: number
    dia_del_anio: number
  }>
  grafica_timeline?: {
    fechas: string[]
    probabilidades: number[]
    gdc_proyectado: number[]
    dias_del_anio: number[]
  }
  imagenes_satelitales?: Array<{
    url: string
    descripcion: string
    fecha_solicitada: string
    fecha_imagen: string
    cloud_cover: number
  }>
}

interface PredictionResult {
  fecha_actual: string
  fecha_floracion_predicha: string
  dias_hasta_floracion: number
  gdc_acumulado: number
  ndvi_actual?: number
  grafica_analisis?: {
    fechas: string[]
    gdc_acumulado: number[]
    ndvi: number[]
    precipitacion_mm?: number[]
    precipitacion_acumulada?: number[]
    temperatura_media?: number[]
    temperatura_max?: number[]
    temperatura_min?: number[]
    fecha_floracion_predicha?: string
  }
  imagenes_satelitales?: Array<{
    url: string
    descripcion: string
    fecha_solicitada: string
    fecha_imagen: string
    cloud_cover: number
  }>
}

interface ProcessStep {
  id: number
  name: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

// Coordenadas predefinidas
const PRESET_COORDINATES = [
  { name: '🇦🇷 Argentina', lat: -38.0, lon: -57.5 },
  { name: '🇲🇽 México Central', lat: 19.2, lon: -99.4 },
  { name: 'Jalisco', lat: 20.6736, lon: -103.3444 },
  { name: 'Sinaloa', lat: 25.8, lon: -108.5 },
]

export default function BloomPredictionPage() {
  const { user } = useAuth()

  // Estados principales
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  )
  const [showNewLocationForm, setShowNewLocationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Estados para modal de imágenes
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    descripcion: string
  } | null>(null)
  const [savingImages, setSavingImages] = useState(false)

  // Estados para caché de datos
  const [usingCachedData, setUsingCachedData] = useState(false)
  const [cachedPrediction, setCachedPrediction] =
    useState<CompletePrediction | null>(null)
  const [forceNewAnalysis, setForceNewAnalysis] = useState(false)
  const [checkingCache, setCheckingCache] = useState(false)

  // Results for each step
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [timelineResult, setTimelineResult] = useState<TimelineResult | null>(
    null
  )
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null)

  // Process step control
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, name: 'Train model with historical data', status: 'pending' },
    { id: 2, name: 'Generate blooming timeline', status: 'pending' },
    { id: 3, name: 'Calculate predictions', status: 'pending' },
  ])

  // Form for new location
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    hectares: 0,
  })

  // Complete analysis parameters
  const [completeParams, setCompleteParams] = useState({
    anioInicio: 2018,
    anioFin: 2024,
    anioPred: 2025,
  })

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (user) {
      fetchLocations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Efecto para cargar caché cuando se selecciona ubicación
  useEffect(() => {
    if (selectedLocation && !forceNewAnalysis) {
      loadCachedPrediction(selectedLocation.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation])

  // ============================================
  // FUNCIONES PARA OBTENER TOKEN
  // ============================================

  const getAuthToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  // ============================================
  // FUNCIONES PARA UBICACIONES
  // ============================================

  const fetchLocations = async () => {
    try {
      const token = await getAuthToken()
      const response = await fetch('/api/farm-locations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLocations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const saveNewLocation = async () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      setError('Nombre, latitud y longitud son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = await getAuthToken()
      const response = await fetch('/api/farm-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLocation),
      })

      if (response.ok) {
        setSuccess('✅ Location saved successfully')
        setShowNewLocationForm(false)
        setNewLocation({
          name: '',
          description: '',
          latitude: 0,
          longitude: 0,
          hectares: 0,
        })
        await fetchLocations()
      } else {
        const data = await response.json()
        setError(data.error || 'Error saving location')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error saving location:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`/api/farm-locations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess('✅ Location deleted')
        if (selectedLocation?.id === id) {
          setSelectedLocation(null)
        }
        await fetchLocations()
      }
    } catch (err) {
      setError('Error deleting location')
      console.error('Error deleting location:', err)
    }
  }

  const setPresetCoordinates = (lat: number, lon: number, name: string) => {
    setNewLocation({
      ...newLocation,
      latitude: lat,
      longitude: lon,
      name: name,
    })
  }

  // ============================================
  // FUNCIONES PARA CACHÉ DE PREDICCIONES
  // ============================================

  const loadCachedPrediction = async (locationId: string) => {
    setCheckingCache(true)
    setError('')

    try {
      // Buscar predicción reciente (últimos 7 días)
      const cached = await getRecentPrediction(locationId, 7)

      if (cached && !forceNewAnalysis) {
        setCachedPrediction(cached)
        setUsingCachedData(true)

        // Convertir datos guardados al formato de la UI
        loadDataFromCache(cached)

        setSuccess('✅ Datos cargados desde caché (últimos 7 días)')
        return true
      }

      setUsingCachedData(false)
      return false
    } catch (error) {
      console.error('Error al cargar caché:', error)
      setUsingCachedData(false)
      return false
    } finally {
      setCheckingCache(false)
    }
  }

  const loadDataFromCache = (cached: CompletePrediction) => {
    // Cargar datos de análisis
    const analysisMap = new Map<string, SavedAnalysis>()
    cached.analysis.forEach((a) => {
      analysisMap.set(a.analysis_type, a)
    })

    // Reconstruir trainResult
    const trainingAnalysis = analysisMap.get('training')
    if (trainingAnalysis) {
      setTrainResult({
        mensaje: 'Datos cargados desde caché',
        metricas: trainingAnalysis.metrics as TrainResult['metricas'],
        grafica_metricas:
          trainingAnalysis.chart_data as TrainResult['grafica_metricas'],
      })
    }

    // Reconstruir timelineResult
    const timelineAnalysis = analysisMap.get('timeline')
    if (timelineAnalysis) {
      const timelineImages = cached.images
        .filter((img) => img.image_type === 'timeline')
        .map((img) => ({
          url: img.image_url,
          descripcion: img.description,
          fecha_solicitada: img.requested_date,
          fecha_imagen: img.image_date,
          cloud_cover: img.cloud_cover,
        }))

      setTimelineResult({
        fecha_pico_probabilidad:
          (timelineAnalysis.metrics?.fecha_pico_probabilidad as string) || '',
        probabilidad_maxima:
          (timelineAnalysis.metrics?.probabilidad_maxima as number) || 0,
        timeline: [],
        grafica_timeline:
          timelineAnalysis.chart_data as TimelineResult['grafica_timeline'],
        imagenes_satelitales: timelineImages,
      })
    }

    // Reconstruir predictionResult
    const phenologyAnalysis = analysisMap.get('phenology')
    if (phenologyAnalysis) {
      const predictionImages = cached.images
        .filter((img) => img.image_type === 'prediction')
        .map((img) => ({
          url: img.image_url,
          descripcion: img.description,
          fecha_solicitada: img.requested_date,
          fecha_imagen: img.image_date,
          cloud_cover: img.cloud_cover,
        }))

      setPredictionResult({
        fecha_actual: cached.prediction.analysis_date,
        fecha_floracion_predicha: cached.prediction.predicted_bloom_date,
        dias_hasta_floracion: cached.prediction.days_to_bloom,
        gdc_acumulado: cached.prediction.gdc_accumulated,
        ndvi_actual: cached.prediction.ndvi_value,
        grafica_analisis:
          phenologyAnalysis.chart_data as PredictionResult['grafica_analisis'],
        imagenes_satelitales: predictionImages,
      })
    }

    // Marcar todos los pasos como completados
    setSteps([
      {
        id: 1,
        name: 'Entrenar modelo con datos históricos',
        status: 'completed',
      },
      { id: 2, name: 'Generar timeline de floración', status: 'completed' },
      { id: 3, name: 'Calcular predicciones', status: 'completed' },
    ])
  }

  // ============================================
  // FUNCIÓN PRINCIPAL: ANÁLISIS COMPLETO
  // ============================================

  const updateStep = (stepId: number, status: ProcessStep['status']) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    )
  }

  const runCompleteAnalysis = async () => {
    if (!selectedLocation) {
      setError('Select a location first')
      return
    }

    // Intentar cargar datos del caché primero (si no se fuerza nuevo análisis)
    if (!forceNewAnalysis) {
      const hasCached = await loadCachedPrediction(selectedLocation.id)
      if (hasCached) {
        setLoading(false)
        return // Usar datos cacheados
      }
    }

    // Si no hay caché o se forzó nuevo análisis, ejecutar análisis ML
    setLoading(true)
    setError('')
    setSuccess('')
    setTrainResult(null)
    setTimelineResult(null)
    setPredictionResult(null)
    setUsingCachedData(false)
    setCachedPrediction(null)

    // Resetear pasos
    setSteps([
      {
        id: 1,
        name: 'Entrenar modelo con datos históricos',
        status: 'pending',
      },
      { id: 2, name: 'Generar timeline de floración', status: 'pending' },
      { id: 3, name: 'Calcular predicciones', status: 'pending' },
    ])

    const API_URL =
      process.env.NEXT_PUBLIC_BLOOM_API_URL || 'http://localhost:8000'

    try {
      // ========== PASO 1: ENTRENAR MODELO ==========
      updateStep(1, 'active')

      const trainData = {
        latitud: selectedLocation.latitude,
        longitud: selectedLocation.longitude,
        año_inicio: completeParams.anioInicio,
        año_fin: completeParams.anioFin,
        epochs: 100,
        batch_size: 32,
        tipo_modelo: 'lstm',
      }

      const trainResponse = await fetch(`${API_URL}/entrenar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainData),
      })

      if (!trainResponse.ok) {
        throw new Error('Error al entrenar el modelo')
      }

      const trainResultData = await trainResponse.json()
      setTrainResult(trainResultData)
      updateStep(1, 'completed')

      // ========== PASO 2: GENERAR TIMELINE ==========
      updateStep(2, 'active')

      // Calcular fecha para análisis
      const hoy = new Date()
      const mesActual = hoy.getMonth() + 1
      let fechaAnalisis
      if (mesActual < 5 || mesActual > 9) {
        fechaAnalisis = `${completeParams.anioPred}-07-15`
      } else {
        fechaAnalisis = `${completeParams.anioPred}-${String(
          mesActual
        ).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      }

      const timelineData = {
        latitud: selectedLocation.latitude,
        longitud: selectedLocation.longitude,
        fecha_actual: fechaAnalisis,
        año_actual: completeParams.anioPred,
        dias_historia: 30,
        dia_inicio_cultivo: '05-15',
      }

      const timelineResponse = await fetch(`${API_URL}/timeline-floracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timelineData),
      })

      if (!timelineResponse.ok) {
        throw new Error('Error al generar timeline')
      }

      const timelineResultData = await timelineResponse.json()
      setTimelineResult(timelineResultData)
      updateStep(2, 'completed')

      // ========== PASO 3: HACER PREDICCIÓN ==========
      updateStep(3, 'active')

      const predictData = {
        latitud: selectedLocation.latitude,
        longitud: selectedLocation.longitude,
        fecha_actual: fechaAnalisis,
        año_actual: completeParams.anioPred,
        dias_historia: 30,
        dia_inicio_cultivo: '05-15',
      }

      const predictResponse = await fetch(`${API_URL}/predecir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictData),
      })

      if (!predictResponse.ok) {
        throw new Error('Error al hacer predicción')
      }

      const predictResultData = await predictResponse.json()
      setPredictionResult(predictResultData)
      updateStep(3, 'completed')

      // Guardar predicción en la base de datos
      await savePredictionToDatabase(
        predictResultData,
        selectedLocation.id,
        fechaAnalisis
      )

      setSuccess('✅ Complete analysis finished successfully')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(`❌ Error: ${errorMessage}`)
      // Marcar el paso actual como error
      const activeStep = steps.find((s) => s.status === 'active')
      if (activeStep) {
        updateStep(activeStep.id, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // FUNCIONES PARA GRÁFICOS
  // ============================================

  const createTrainingChart = (
    data: NonNullable<TrainResult['grafica_metricas']>
  ) => {
    return {
      labels: data.epocas,
      datasets: [
        {
          label: 'Loss Entrenamiento',
          data: data.loss_train,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Loss Validación',
          data: data.loss_val,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'MAE Entrenamiento',
          data: data.mae_train,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y1',
        },
        {
          label: 'MAE Validación',
          data: data.mae_val,
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    }
  }

  const createTimelineChart = (
    data: NonNullable<TimelineResult['grafica_timeline']>
  ) => {
    const backgroundColors = data.probabilidades.map((prob) => {
      if (prob < 25) return 'rgba(239, 68, 68, 0.6)'
      if (prob < 50) return 'rgba(249, 115, 22, 0.6)'
      if (prob < 75) return 'rgba(245, 158, 11, 0.6)'
      return 'rgba(34, 197, 94, 0.6)'
    })

    return {
      labels: data.fechas,
      datasets: [
        {
          label: 'Probabilidad de Floración (%)',
          data: data.probabilidades,
          backgroundColor: backgroundColors,
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
      ],
    }
  }

  const createPhenologyChart = (
    data: NonNullable<PredictionResult['grafica_analisis']>
  ) => {
    return {
      labels: data.fechas,
      datasets: [
        {
          label: 'GDC Acumulado',
          data: data.gdc_acumulado,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'NDVI',
          data: data.ndvi,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    }
  }

  const createPrecipitationChart = (
    data: NonNullable<PredictionResult['grafica_analisis']>
  ) => {
    if (!data.precipitacion_mm || !data.precipitacion_acumulada) return null

    return {
      labels: data.fechas,
      datasets: [
        {
          label: 'Precipitación Diaria (mm)',
          data: data.precipitacion_mm,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Precipitación Acumulada (mm)',
          data: data.precipitacion_acumulada,
          borderColor: 'rgb(29, 78, 216)',
          backgroundColor: 'rgba(29, 78, 216, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
          borderWidth: 2,
          fill: false,
        },
      ],
    }
  }

  const createTemperatureChart = (
    data: NonNullable<PredictionResult['grafica_analisis']>
  ) => {
    if (!data.temperatura_media) return null

    return {
      labels: data.fechas,
      datasets: [
        {
          label: 'T°C Media',
          data: data.temperatura_media,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          fill: false,
        },
        ...(data.temperatura_max
          ? [
              {
                label: 'T°C Máxima',
                data: data.temperatura_max,
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                borderWidth: 1,
                borderDash: [5, 5],
              },
            ]
          : []),
        ...(data.temperatura_min
          ? [
              {
                label: 'T°C Mínima',
                data: data.temperatura_min,
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                tension: 0.4,
                borderWidth: 1,
                borderDash: [5, 5],
              },
            ]
          : []),
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Fecha' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
      },
    },
  }

  const timelineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '🔮 Timeline de Probabilidad de Floración',
        font: { size: 16, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Fecha' },
      },
      y: {
        title: { display: true, text: 'Probabilidad (%)' },
        min: 0,
        max: 105,
      },
    },
  }

  // ============================================
  // FUNCIONES PARA IMÁGENES SATELITALES
  // ============================================

  const openImageModal = (url: string, descripcion: string) => {
    setSelectedImage({ url, descripcion })
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage(null)
  }

  // ============================================
  // FUNCIONES PARA GUARDAR IMÁGENES EN BUCKET
  // ============================================

  const saveImageToBucket = async (
    imageUrl: string,
    description: string,
    predictionId: string
  ) => {
    try {
      // Descargar la imagen desde la URL
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Error al descargar imagen')
      }

      const blob = await response.blob()
      const file = new File([blob], `satellite-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      // Subir al bucket usando nuestra función
      const result = await uploadSatelliteImage(file, predictionId)

      if (result.success) {
        console.log('✅ Imagen guardada en bucket:', result.url)
        return result
      } else {
        throw new Error(result.error || 'Error al subir imagen')
      }
    } catch (error) {
      console.error('Error al guardar imagen:', error)
      throw error
    }
  }

  const saveAllImagesToBucket = async () => {
    if (!predictionResult && !timelineResult) {
      setError('No hay imágenes para guardar')
      return
    }

    setSavingImages(true)
    setError('')

    try {
      const images: Array<{ url: string; descripcion: string }> = []

      // Recopilar todas las imágenes
      if (timelineResult?.imagenes_satelitales) {
        images.push(
          ...timelineResult.imagenes_satelitales.map((img) => ({
            url: img.url,
            descripcion: `Timeline: ${img.descripcion}`,
          }))
        )
      }

      if (predictionResult?.imagenes_satelitales) {
        images.push(
          ...predictionResult.imagenes_satelitales.map((img) => ({
            url: img.url,
            descripcion: `Predicción: ${img.descripcion}`,
          }))
        )
      }

      if (images.length === 0) {
        setError('No se encontraron imágenes para guardar')
        return
      }

      // Generar un ID temporal para la predicción si no existe
      const tempPredictionId = `temp-${Date.now()}`

      // Guardar cada imagen
      let savedCount = 0
      for (const image of images) {
        try {
          await saveImageToBucket(
            image.url,
            image.descripcion,
            tempPredictionId
          )
          savedCount++
        } catch (error) {
          console.error(`Error al guardar imagen: ${image.descripcion}`, error)
        }
      }

      if (savedCount > 0) {
        setSuccess(
          `✅ Se guardaron ${savedCount} de ${images.length} imágenes en el bucket`
        )
      } else {
        setError('No se pudo guardar ninguna imagen')
      }
    } catch (error) {
      setError('Error al guardar imágenes en el bucket')
      console.error('Error:', error)
    } finally {
      setSavingImages(false)
    }
  }

  // ============================================
  // GUARDAR PREDICCIÓN EN BASE DE DATOS
  // ============================================

  const savePredictionToDatabase = async (
    prediction: PredictionResult,
    locationId: string,
    analysisDate: string
  ) => {
    try {
      // Preparar datos de la predicción principal
      const predictionData: BloomPredictionData = {
        location_id: locationId,
        analysis_date: analysisDate,
        predicted_bloom_date: prediction.fecha_floracion_predicha,
        days_to_bloom: prediction.dias_hasta_floracion,
        gdc_accumulated: prediction.gdc_acumulado,
        ndvi_value: prediction.ndvi_actual || undefined,
        model_version: 'LSTM-v1.0',
        temperature_avg: prediction.grafica_analisis?.temperatura_media
          ? prediction.grafica_analisis.temperatura_media.reduce(
              (a, b) => a + b,
              0
            ) / prediction.grafica_analisis.temperatura_media.length
          : undefined,
        precipitation_total: prediction.grafica_analisis
          ?.precipitacion_acumulada
          ? Math.max(...prediction.grafica_analisis.precipitacion_acumulada)
          : undefined,
        metadata: {
          completeParams: completeParams as Record<string, unknown>,
          analysis_type: 'complete_ml_analysis',
        },
      }

      // Preparar datos de análisis para las gráficas
      const analysisData: AnalysisData[] = []

      // Agregar datos de entrenamiento si existen
      if (trainResult?.grafica_metricas) {
        analysisData.push({
          analysis_type: 'training',
          chart_data: trainResult.grafica_metricas,
          metrics: trainResult.metricas,
        })
      }

      // Agregar datos de timeline si existen
      if (timelineResult?.grafica_timeline) {
        analysisData.push({
          analysis_type: 'timeline',
          chart_data: timelineResult.grafica_timeline,
          metrics: {
            fecha_pico_probabilidad: timelineResult.fecha_pico_probabilidad,
            probabilidad_maxima: timelineResult.probabilidad_maxima,
          },
        })
      }

      // Agregar datos de análisis fenológico
      if (prediction.grafica_analisis) {
        analysisData.push({
          analysis_type: 'phenology',
          chart_data: prediction.grafica_analisis,
        })

        // Si hay datos de precipitación, agregar análisis separado
        if (prediction.grafica_analisis.precipitacion_mm) {
          analysisData.push({
            analysis_type: 'precipitation',
            chart_data: {
              fechas: prediction.grafica_analisis.fechas,
              precipitacion_mm: prediction.grafica_analisis.precipitacion_mm,
              precipitacion_acumulada:
                prediction.grafica_analisis.precipitacion_acumulada,
            },
          })
        }

        // Si hay datos de temperatura, agregar análisis separado
        if (prediction.grafica_analisis.temperatura_media) {
          analysisData.push({
            analysis_type: 'temperature',
            chart_data: {
              fechas: prediction.grafica_analisis.fechas,
              temperatura_media: prediction.grafica_analisis.temperatura_media,
              temperatura_max: prediction.grafica_analisis.temperatura_max,
              temperatura_min: prediction.grafica_analisis.temperatura_min,
            },
          })
        }
      }

      // Preparar datos de imágenes satelitales
      const satelliteImages: SatelliteImageData[] = []

      // Agregar imágenes del timeline si existen
      if (timelineResult?.imagenes_satelitales) {
        timelineResult.imagenes_satelitales.forEach((img) => {
          satelliteImages.push({
            image_url: img.url,
            description: img.descripcion,
            requested_date: img.fecha_solicitada,
            image_date: img.fecha_imagen,
            cloud_cover: img.cloud_cover,
            image_type: 'timeline',
            metadata: { source: 'timeline_analysis' },
          })
        })
      }

      // Agregar imágenes de la predicción si existen
      if (prediction.imagenes_satelitales) {
        prediction.imagenes_satelitales.forEach((img) => {
          satelliteImages.push({
            image_url: img.url,
            description: img.descripcion,
            requested_date: img.fecha_solicitada,
            image_date: img.fecha_imagen,
            cloud_cover: img.cloud_cover,
            image_type: 'prediction',
            metadata: { source: 'prediction_analysis' },
          })
        })
      }

      // Guardar todo en la base de datos
      const result = await savePredictionWithAnalysis(
        predictionData,
        analysisData,
        satelliteImages
      )

      if (result.success) {
        console.log('✅ Predicción guardada exitosamente:', result.predictionId)
      } else {
        console.error('❌ Error al guardar predicción:', result.error)
        setError(`Error al guardar: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving prediction:', error)
      setError('Error al guardar la predicción en la base de datos')
    }
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Por favor inicia sesión para acceder a esta función</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-400" />
            Predicción de Floración con IA
          </h1>
          <p className="text-gray-300 mt-2">
            Análisis fenológico completo con Machine Learning (LSTM + Datos
            Satelitales)
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-900 border border-red-700 border-l-4 border-l-red-500 p-4 mb-4 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-700 border-l-4 border-l-green-500 p-4 mb-4 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Locations */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">My Fields</h2>
                <button
                  onClick={() => setShowNewLocationForm(true)}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* New location form */}
              {showNewLocationForm && (
                <div className="mb-4 p-4 bg-gray-800 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white">New Field</h3>
                    <button onClick={() => setShowNewLocationForm(false)}>
                      <X className="h-5 w-5 text-gray-400 hover:text-white" />
                    </button>
                  </div>

                  {/* Preset coordinates */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-300 mb-2">
                      Preset coordinates:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COORDINATES.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() =>
                            setPresetCoordinates(
                              preset.lat,
                              preset.lon,
                              preset.name
                            )
                          }
                          className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 hover:text-white transition"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Field name"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={newLocation.latitude || ''}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={newLocation.longitude || ''}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newLocation.description}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    rows={2}
                  />
                  <button
                    onClick={saveNewLocation}
                    disabled={loading}
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:bg-gray-600 disabled:text-gray-400 transition"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Location list */}
              <div className="space-y-2 mb-4">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedLocation?.id === loc.id
                        ? 'bg-green-900 border-green-500 ring-2 ring-green-500/50'
                        : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{loc.name}</h3>
                        <p className="text-sm text-gray-300 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteLocation(loc.id)
                        }}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {locations.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    You don&apos;t have any saved fields
                  </p>
                )}
              </div>

              {/* Interactive Map */}
              {locations.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    📍 Fields Map
                  </h3>
                  <LocationMap
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
              {!selectedLocation ? (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Select or create a field to start the analysis
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    🚀 Automated Complete Analysis
                  </h2>
                  <p className="text-gray-300 mb-6">
                    The system will automatically:
                    <br />
                    1️⃣ Train the model with historical data
                    <br />
                    2️⃣ Generate the blooming timeline
                    <br />
                    3️⃣ Make predictions for {completeParams.anioPred}
                  </p>

                  {/* Parameters */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Year
                      </label>
                      <input
                        type="number"
                        min="2018"
                        max="2024"
                        value={completeParams.anioInicio}
                        onChange={(e) =>
                          setCompleteParams({
                            ...completeParams,
                            anioInicio: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Year
                      </label>
                      <input
                        type="number"
                        min="2018"
                        max="2024"
                        value={completeParams.anioFin}
                        onChange={(e) =>
                          setCompleteParams({
                            ...completeParams,
                            anioFin: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prediction Year
                      </label>
                      <input
                        type="number"
                        min="2025"
                        max="2030"
                        value={completeParams.anioPred}
                        onChange={(e) =>
                          setCompleteParams({
                            ...completeParams,
                            anioPred: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Indicador de caché */}
                  {checkingCache && (
                    <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        <p className="text-blue-300">
                          Buscando análisis previos...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de datos cacheados */}
                  {usingCachedData && cachedPrediction && (
                    <div className="bg-purple-900/30 border border-purple-700 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-purple-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-purple-200 font-semibold mb-1">
                            📋 Mostrando datos guardados
                          </p>
                          <p className="text-purple-300 text-sm mb-2">
                            Análisis realizado el{' '}
                            {new Date(
                              cachedPrediction.prediction.created_at
                            ).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="forceNewAnalysis"
                              checked={forceNewAnalysis}
                              onChange={(e) =>
                                setForceNewAnalysis(e.target.checked)
                              }
                              className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                            />
                            <label
                              htmlFor="forceNewAnalysis"
                              className="text-sm text-purple-300 cursor-pointer"
                            >
                              Ejecutar análisis nuevo (ignora caché)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón iniciar análisis */}
                  <button
                    onClick={runCompleteAnalysis}
                    disabled={loading || checkingCache}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : checkingCache ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verificando...
                      </>
                    ) : usingCachedData && !forceNewAnalysis ? (
                      <>✅ Datos Cargados</>
                    ) : (
                      <>
                        🚀{' '}
                        {usingCachedData
                          ? 'Ejecutar Nuevo Análisis'
                          : 'Iniciar Análisis Completo'}
                      </>
                    )}
                  </button>

                  {/* Progress Steps */}
                  {(loading ||
                    trainResult ||
                    timelineResult ||
                    predictionResult) && (
                    <div className="mt-8 bg-gray-800 border border-gray-600 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        📊 Progreso del Análisis
                      </h3>
                      <div className="space-y-4">
                        {steps.map((step) => (
                          <div
                            key={step.id}
                            className={`p-4 rounded-lg border-l-4 transition ${
                              step.status === 'completed'
                                ? 'bg-green-900/50 border-green-500'
                                : step.status === 'active'
                                ? 'bg-blue-900/50 border-blue-500'
                                : step.status === 'error'
                                ? 'bg-red-900/50 border-red-500'
                                : 'bg-gray-700 border-gray-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">
                                {step.name}
                              </span>
                              {step.status === 'active' && (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                              )}
                              {step.status === 'completed' && (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              )}
                              {step.status === 'error' && (
                                <AlertCircle className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resultados Paso 1: Entrenamiento */}
                  {trainResult && (
                    <div className="mt-6 bg-green-900/30 border border-green-600 p-6 rounded-lg border-l-4 border-l-green-500">
                      <h3 className="text-lg font-semibold text-green-300 mb-4">
                        ✅ Paso 1: Modelo Entrenado Exitosamente
                      </h3>
                      {trainResult.metricas && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-800 border border-gray-700 p-3 rounded">
                            <p className="text-sm text-gray-300">
                              MAE (Error Promedio)
                            </p>
                            <p className="text-xl font-bold text-green-400">
                              {trainResult.metricas.mae.toFixed(4)} días
                            </p>
                          </div>
                          <div className="bg-gray-800 border border-gray-700 p-3 rounded">
                            <p className="text-sm text-gray-300">RMSE</p>
                            <p className="text-xl font-bold text-green-400">
                              {trainResult.metricas.rmse.toFixed(4)} días
                            </p>
                          </div>
                          {trainResult.mejor_epoca && (
                            <div className="bg-gray-800 border border-gray-700 p-3 rounded col-span-2">
                              <p className="text-sm text-gray-300">
                                🏆 Mejor Época
                              </p>
                              <p className="text-xl font-bold text-green-400">
                                {trainResult.mejor_epoca}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Gráfico de métricas de entrenamiento */}
                      {trainResult.grafica_metricas && (
                        <div className="mt-4 bg-gray-800 border border-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            Métricas de Entrenamiento
                          </h4>
                          <div className="h-80">
                            <Line
                              data={createTrainingChart(
                                trainResult.grafica_metricas
                              )}
                              options={{
                                ...chartOptions,
                                plugins: {
                                  ...chartOptions.plugins,
                                  title: {
                                    display: true,
                                    text: '📊 Progreso del Entrenamiento',
                                  },
                                },
                                scales: {
                                  x: {
                                    title: { display: true, text: 'Época' },
                                  },
                                  y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: { display: true, text: 'Loss' },
                                  },
                                  y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    title: {
                                      display: true,
                                      text: 'MAE (días)',
                                    },
                                    grid: { drawOnChartArea: false },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resultados Paso 2: Timeline */}
                  {timelineResult && (
                    <div className="mt-6 bg-blue-900/30 border border-blue-600 p-6 rounded-lg border-l-4 border-l-blue-500">
                      <h3 className="text-lg font-semibold text-blue-300 mb-4">
                        ✅ Paso 2: Timeline Generado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800 border border-gray-700 p-4 rounded">
                          <p className="text-sm text-gray-300">
                            📅 Fecha con Mayor Probabilidad
                          </p>
                          <p className="text-xl font-bold text-blue-400">
                            {timelineResult.fecha_pico_probabilidad} (
                            {timelineResult.probabilidad_maxima.toFixed(1)}%)
                          </p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-4 rounded">
                          <p className="text-sm text-gray-300">
                            📊 Total de Días Analizados
                          </p>
                          <p className="text-xl font-bold text-blue-400">
                            {timelineResult.timeline.length}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-800 border border-gray-700 p-4 rounded mb-4">
                        <p className="font-semibold text-white mb-2">
                          📊 Top 5 Fechas:
                        </p>
                        <ul className="space-y-2">
                          {timelineResult.timeline
                            .sort((a, b) => b.probabilidad - a.probabilidad)
                            .slice(0, 5)
                            .map((dia, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center"
                              >
                                <span>
                                  {idx + 1}. {dia.fecha} -{' '}
                                  {dia.probabilidad.toFixed(1)}%
                                </span>
                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                  GDC: {dia.gdc_proyectado.toFixed(1)}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Gráfico de timeline */}
                      {timelineResult.grafica_timeline && (
                        <div className="mt-4 bg-gray-800 border border-gray-700 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Probabilidad de Floración
                          </h4>
                          <div className="h-80">
                            <Bar
                              data={createTimelineChart(
                                timelineResult.grafica_timeline
                              )}
                              options={timelineChartOptions}
                            />
                          </div>
                        </div>
                      )}

                      {/* Imágenes Satelitales del Timeline */}
                      {timelineResult.imagenes_satelitales &&
                        timelineResult.imagenes_satelitales.length > 0 && (
                          <div className="mt-4 bg-gray-800 border border-gray-700 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <ImageIcon className="h-5 w-5 text-blue-400" />
                              🛰️ Imágenes Satelitales (Sentinel-2)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {timelineResult.imagenes_satelitales.map(
                                (img, idx) => (
                                  <div
                                    key={idx}
                                    className="border-2 border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={img.url}
                                      alt={img.descripcion}
                                      className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() =>
                                        openImageModal(img.url, img.descripcion)
                                      }
                                    />
                                    <div className="p-3 bg-gray-700">
                                      <h5 className="font-semibold text-white text-sm mb-2">
                                        {img.descripcion}
                                      </h5>
                                      <p className="text-xs text-gray-300 mb-1">
                                        📅 Solicitada: {img.fecha_solicitada}
                                      </p>
                                      <p className="text-xs text-gray-300 mb-2">
                                        🛰️ Imagen: {img.fecha_imagen}
                                      </p>
                                      <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                          img.cloud_cover < 10
                                            ? 'bg-green-800 text-green-200'
                                            : img.cloud_cover < 30
                                            ? 'bg-yellow-800 text-yellow-200'
                                            : 'bg-red-800 text-red-200'
                                        }`}
                                      >
                                        ☁️ {img.cloud_cover.toFixed(1)}% nubes
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Resultados Paso 3: Predicción */}
                  {predictionResult && (
                    <div className="mt-6 bg-purple-900/30 border border-purple-600 p-6 rounded-lg border-l-4 border-l-purple-500">
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">
                        ✅ Paso 3: Predicción Realizada
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-center">
                          <p className="text-sm text-gray-300 mb-2">
                            📅 Fecha Actual
                          </p>
                          <p className="text-lg font-bold text-purple-400">
                            {predictionResult.fecha_actual}
                          </p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-center">
                          <p className="text-sm text-gray-300 mb-2">
                            🌸 Floración Predicha
                          </p>
                          <p className="text-lg font-bold text-purple-400">
                            {predictionResult.fecha_floracion_predicha}
                          </p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-center">
                          <p className="text-sm text-gray-300 mb-2">
                            ⏳ Días Restantes
                          </p>
                          <p className="text-lg font-bold text-purple-400">
                            {predictionResult.dias_hasta_floracion} días
                          </p>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-center">
                          <p className="text-sm text-gray-300 mb-2">
                            🌡️ GDC Acumulado
                          </p>
                          <p className="text-lg font-bold text-purple-400">
                            {predictionResult.gdc_acumulado.toFixed(2)}
                          </p>
                        </div>
                        {predictionResult.ndvi_actual && (
                          <div className="bg-gray-800 border border-gray-700 p-3 rounded text-center col-span-2 md:col-span-4">
                            <p className="text-sm text-gray-300 mb-2">
                              🌿 NDVI Actual
                            </p>
                            <p className="text-lg font-bold text-purple-400">
                              {predictionResult.ndvi_actual.toFixed(3)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Gráficos de Análisis Fenológico */}
                      {predictionResult.grafica_analisis && (
                        <div className="mt-6 space-y-6">
                          <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="h-6 w-6" />
                            Análisis Fenológico Completo
                          </h4>

                          {/* Panel 1: GDC y NDVI */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                              <Leaf className="h-5 w-5 text-green-600" />
                              🌱 GDC Acumulado y NDVI
                            </h5>
                            <div className="h-80">
                              <Line
                                data={createPhenologyChart(
                                  predictionResult.grafica_analisis
                                )}
                                options={{
                                  ...chartOptions,
                                  plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                      display: true,
                                      text: 'Desarrollo Fenológico',
                                    },
                                  },
                                  scales: {
                                    x: {
                                      title: { display: true, text: 'Fecha' },
                                    },
                                    y: {
                                      type: 'linear',
                                      display: true,
                                      position: 'left',
                                      title: {
                                        display: true,
                                        text: 'GDC Acumulado',
                                      },
                                    },
                                    y1: {
                                      type: 'linear',
                                      display: true,
                                      position: 'right',
                                      title: { display: true, text: 'NDVI' },
                                      min: 0,
                                      max: 1,
                                      grid: { drawOnChartArea: false },
                                    },
                                  },
                                }}
                              />
                            </div>
                          </div>

                          {/* Panel 2: Precipitación */}
                          {predictionResult.grafica_analisis
                            .precipitacion_mm && (
                            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                              <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-400" />
                                💧 Precipitación
                              </h5>
                              <div className="h-80">
                                <Line
                                  data={
                                    createPrecipitationChart(
                                      predictionResult.grafica_analisis
                                    )!
                                  }
                                  options={{
                                    ...chartOptions,
                                    plugins: {
                                      ...chartOptions.plugins,
                                      title: {
                                        display: true,
                                        text: 'Análisis de Precipitación',
                                      },
                                    },
                                    scales: {
                                      x: {
                                        title: { display: true, text: 'Fecha' },
                                      },
                                      y: {
                                        type: 'linear',
                                        display: true,
                                        position: 'left',
                                        title: {
                                          display: true,
                                          text: 'Diaria (mm)',
                                        },
                                      },
                                      y1: {
                                        type: 'linear',
                                        display: true,
                                        position: 'right',
                                        title: {
                                          display: true,
                                          text: 'Acumulada (mm)',
                                        },
                                        grid: { drawOnChartArea: false },
                                      },
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Panel 3: Temperatura */}
                          {predictionResult.grafica_analisis
                            .temperatura_media && (
                            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                              <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Thermometer className="h-5 w-5 text-red-400" />
                                🌡️ Temperatura
                              </h5>
                              <div className="h-80">
                                <Line
                                  data={
                                    createTemperatureChart(
                                      predictionResult.grafica_analisis
                                    )!
                                  }
                                  options={{
                                    ...chartOptions,
                                    plugins: {
                                      ...chartOptions.plugins,
                                      title: {
                                        display: true,
                                        text: 'Análisis de Temperatura',
                                      },
                                    },
                                    scales: {
                                      x: {
                                        title: { display: true, text: 'Fecha' },
                                      },
                                      y: {
                                        title: {
                                          display: true,
                                          text: 'Temperatura (°C)',
                                        },
                                      },
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Imágenes Satelitales de la Predicción */}
                      {predictionResult.imagenes_satelitales &&
                        predictionResult.imagenes_satelitales.length > 0 && (
                          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                              <ImageIcon className="h-5 w-5" />
                              🛰️ Imágenes Satelitales Actuales
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {predictionResult.imagenes_satelitales.map(
                                (img, idx) => (
                                  <div
                                    key={idx}
                                    className="border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-purple-500"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={img.url}
                                      alt={img.descripcion}
                                      className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() =>
                                        openImageModal(img.url, img.descripcion)
                                      }
                                    />
                                    <div className="p-3 bg-gray-700 border-t border-gray-600">
                                      <h5 className="font-semibold text-white text-sm mb-2">
                                        {img.descripcion}
                                      </h5>
                                      <p className="text-xs text-gray-300 mb-1">
                                        📅 Solicitada: {img.fecha_solicitada}
                                      </p>
                                      <p className="text-xs text-gray-300 mb-2">
                                        🛰️ Imagen: {img.fecha_imagen}
                                      </p>
                                      <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                          img.cloud_cover < 10
                                            ? 'bg-green-900 text-green-200'
                                            : img.cloud_cover < 30
                                            ? 'bg-yellow-900 text-yellow-200'
                                            : 'bg-red-900 text-red-200'
                                        }`}
                                      >
                                        ☁️ {img.cloud_cover.toFixed(1)}% nubes
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Botón para guardar imágenes en bucket */}
                  {(timelineResult?.imagenes_satelitales?.length ||
                    predictionResult?.imagenes_satelitales?.length) && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={saveAllImagesToBucket}
                        disabled={savingImages}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                      >
                        {savingImages ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Guardando imágenes...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5" />
                            Guardar Imágenes en Bucket
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-400 mt-2">
                        Guarda todas las imágenes satelitales en tu
                        almacenamiento personal
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal para imagen completa */}
        {showImageModal && selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeImageModal}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 z-10"
              >
                ×
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.url}
                alt={selectedImage.descripcion}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded">
                <p className="font-semibold">{selectedImage.descripcion}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
