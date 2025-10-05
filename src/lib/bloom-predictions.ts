import { supabase } from './supabase'

// Tipos para la base de datos
export interface BloomPredictionData {
  location_id: string
  analysis_date: string
  predicted_bloom_date: string
  days_to_bloom: number
  gdc_accumulated: number
  ndvi_value?: number
  confidence_score?: number
  temperature_avg?: number
  precipitation_total?: number
  model_version?: string
  metadata?: Record<string, unknown>
}

export interface SatelliteImageData {
  image_url: string
  image_path?: string
  description: string
  requested_date: string
  image_date: string
  cloud_cover: number
  image_type?: string
  metadata?: Record<string, unknown>
}

export interface AnalysisData {
  analysis_type:
    | 'training'
    | 'timeline'
    | 'phenology'
    | 'precipitation'
    | 'temperature'
  chart_data: Record<string, unknown>
  metrics?: Record<string, unknown>
}

// Tipos para datos recuperados de la base de datos
export interface SavedPrediction {
  id: string
  location_id: string
  farmer_id: string
  prediction_date: string
  analysis_date: string
  predicted_bloom_date: string
  days_to_bloom: number
  gdc_accumulated: number
  ndvi_value?: number
  confidence_score?: number
  temperature_avg?: number
  precipitation_total?: number
  model_version?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface SavedAnalysis {
  id: string
  prediction_id: string
  farmer_id: string
  analysis_type: string
  chart_data: Record<string, unknown>
  metrics?: Record<string, unknown>
  created_at: string
}

export interface SavedSatelliteImage {
  id: string
  prediction_id: string
  farmer_id: string
  image_url: string
  image_path?: string
  description: string
  requested_date: string
  image_date: string
  cloud_cover: number
  image_type?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface CompletePrediction {
  prediction: SavedPrediction
  analysis: SavedAnalysis[]
  images: SavedSatelliteImage[]
}

// Función para verificar si existe una predicción reciente
export async function getRecentPrediction(
  locationId: string,
  daysThreshold: number = 7
): Promise<CompletePrediction | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Calcular fecha límite
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

    // Buscar predicción reciente
    const { data: predictions, error: predictionError } = await supabase
      .from('bloom_predictions')
      .select('*')
      .eq('location_id', locationId)
      .eq('farmer_id', user.id)
      .gte('created_at', thresholdDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (predictionError) {
      console.error('Error al buscar predicción:', predictionError)
      return null
    }

    if (!predictions || predictions.length === 0) {
      return null
    }

    const prediction = predictions[0] as SavedPrediction

    // Obtener análisis asociados
    const { data: analysis, error: analysisError } = await supabase
      .from('prediction_analysis')
      .select('*')
      .eq('prediction_id', prediction.id)
      .eq('farmer_id', user.id)

    if (analysisError) {
      console.error('Error al obtener análisis:', analysisError)
    }

    // Obtener imágenes asociadas
    const { data: images, error: imagesError } = await supabase
      .from('satellite_images')
      .select('*')
      .eq('prediction_id', prediction.id)
      .eq('farmer_id', user.id)

    if (imagesError) {
      console.error('Error al obtener imágenes:', imagesError)
    }

    return {
      prediction,
      analysis: (analysis || []) as SavedAnalysis[],
      images: (images || []) as SavedSatelliteImage[],
    }
  } catch (error) {
    console.error('Error al verificar predicción reciente:', error)
    return null
  }
}

// Función para guardar una predicción completa
export async function savePredictionWithAnalysis(
  predictionData: BloomPredictionData,
  analysisData: AnalysisData[],
  satelliteImages: SatelliteImageData[] = []
) {
  try {
    // 1. Obtener el usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // 2. Guardar la predicción principal
    const { data: prediction, error: predictionError } = await supabase
      .from('bloom_predictions')
      .insert({
        ...predictionData,
        farmer_id: user.id,
      })
      .select()
      .single()

    if (predictionError) {
      throw new Error(`Error al guardar predicción: ${predictionError.message}`)
    }

    const predictionId = prediction.id

    // 3. Guardar datos de análisis
    if (analysisData.length > 0) {
      const analysisToInsert = analysisData.map((analysis) => ({
        ...analysis,
        prediction_id: predictionId,
        farmer_id: user.id,
      }))

      const { error: analysisError } = await supabase
        .from('prediction_analysis')
        .insert(analysisToInsert)

      if (analysisError) {
        console.error('Error al guardar análisis:', analysisError)
      }
    }

    // 4. Guardar imágenes satelitales
    if (satelliteImages.length > 0) {
      const imagesToInsert = satelliteImages.map((image) => ({
        ...image,
        prediction_id: predictionId,
        farmer_id: user.id,
      }))

      const { error: imagesError } = await supabase
        .from('satellite_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('Error al guardar imágenes:', imagesError)
      }
    }

    return {
      success: true,
      predictionId,
      message: 'Predicción guardada exitosamente',
    }
  } catch (error) {
    console.error('Error al guardar predicción:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Función para subir imagen al bucket de Supabase
export async function uploadSatelliteImage(
  file: File,
  predictionId: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${predictionId}/${Date.now()}.${fileExt}`

    // Subir archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from('satellite-images')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('satellite-images')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Función para obtener predicciones del usuario
export async function getUserPredictions(locationId?: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    let query = supabase
      .from('bloom_predictions')
      .select(
        `
        *,
        farm_locations!inner(name, latitude, longitude, hectares),
        prediction_analysis(*),
        satellite_images(*)
      `
      )
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener predicciones: ${error.message}`)
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error al obtener predicciones:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Función para eliminar una predicción
export async function deletePrediction(predictionId: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Eliminar archivos del storage primero
    const { data: images } = await supabase
      .from('satellite_images')
      .select('image_path')
      .eq('prediction_id', predictionId)
      .eq('farmer_id', user.id)

    if (images && images.length > 0) {
      const filesToDelete = images
        .filter((img) => img.image_path)
        .map((img) => img.image_path!)

      if (filesToDelete.length > 0) {
        await supabase.storage.from('satellite-images').remove(filesToDelete)
      }
    }

    // Eliminar predicción (cascade eliminará análisis e imágenes)
    const { error } = await supabase
      .from('bloom_predictions')
      .delete()
      .eq('id', predictionId)
      .eq('farmer_id', user.id)

    if (error) {
      throw new Error(`Error al eliminar predicción: ${error.message}`)
    }

    return {
      success: true,
      message: 'Predicción eliminada exitosamente',
    }
  } catch (error) {
    console.error('Error al eliminar predicción:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
