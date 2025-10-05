import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const {
      location_id,
      analysis_date,
      predicted_bloom_date,
      days_to_bloom,
      gdc_accumulated,
      ndvi_value,
      confidence_score,
      temperature_avg,
      precipitation_total,
      model_version,
      metadata,
    } = body

    // Validaciones
    if (!location_id || !analysis_date || !predicted_bloom_date) {
      return NextResponse.json(
        {
          error:
            'location_id, analysis_date y predicted_bloom_date son requeridos',
        },
        { status: 400 }
      )
    }

    // Verificar que la ubicación pertenezca al usuario usando supabaseAdmin
    const { data: location, error: locationError } = await supabaseAdmin
      .from('farm_locations')
      .select('farmer_id')
      .eq('id', location_id)
      .single()

    if (locationError || !location || location.farmer_id !== user.id) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada o no autorizada' },
        { status: 403 }
      )
    }

    // Insertar predicción usando supabaseAdmin para evitar problemas con RLS
    const { data, error } = await supabaseAdmin
      .from('bloom_predictions')
      .insert({
        location_id,
        farmer_id: user.id,
        analysis_date,
        predicted_bloom_date,
        days_to_bloom: days_to_bloom || null,
        gdc_accumulated: gdc_accumulated || null,
        ndvi_value: ndvi_value || null,
        confidence_score: confidence_score || null,
        temperature_avg: temperature_avg || null,
        precipitation_total: precipitation_total || null,
        model_version: model_version || 'LSTM-v1.0',
        metadata: metadata || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prediction:', error)
      return NextResponse.json(
        { error: 'Error al guardar predicción' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/bloom-predictions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const locationId = searchParams.get('location_id')

    // Usar supabaseAdmin para obtener predicciones
    let query = supabaseAdmin
      .from('bloom_predictions')
      .select(
        `
        *,
        farm_locations (
          name,
          latitude,
          longitude
        )
      `
      )
      .eq('farmer_id', user.id)
      .order('prediction_date', { ascending: false })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching predictions:', error)
      return NextResponse.json(
        { error: 'Error al obtener predicciones' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in GET /api/bloom-predictions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
