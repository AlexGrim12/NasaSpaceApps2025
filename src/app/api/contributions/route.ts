import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CONTRIBUTION_POINTS, ContributionType } from '@/types/farmer-ranking'

// GET /api/contributions - Obtener contribuciones
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const farmerId = searchParams.get('farmerId')
    const type = searchParams.get('type')
    const verified = searchParams.get('verified')

    let query = supabase
      .from('contributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (farmerId) {
      query = query.eq('farmer_id', farmerId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (verified !== null) {
      query = query.eq('verified', verified === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching contributions:', error)
      return NextResponse.json(
        { error: 'Error al obtener contribuciones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contributions - Crear nueva contribución
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación - obtener token del header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, description, metadata } = body

    // Validar tipo de contribución
    if (!type || !Object.keys(CONTRIBUTION_POINTS).includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de contribución inválido' },
        { status: 400 }
      )
    }

    // Validar descripción
    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            'La descripción es requerida y debe tener al menos 10 caracteres',
        },
        { status: 400 }
      )
    }

    // Obtener puntos según el tipo
    const pointsEarned =
      CONTRIBUTION_POINTS[type as ContributionType]

    // Crear contribución usando supabaseAdmin para bypass RLS
    const { data, error } = await supabaseAdmin
      .from('contributions')
      .insert({
        farmer_id: user.id,
        type,
        points_earned: pointsEarned,
        description,
        verified: false, // Las contribuciones deben ser verificadas por un admin
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contribution:', error)
      return NextResponse.json(
        { error: 'Error al crear contribución' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message:
        'Contribución creada exitosamente. Está pendiente de verificación.',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado del servidor' },
      { status: 500 }
    )
  }
}
