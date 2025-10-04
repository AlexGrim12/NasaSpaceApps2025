import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/rankings - Obtener top de agricultores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const level = searchParams.get('level')

    // Llamar a la función de PostgreSQL para obtener el ranking con posiciones
    let query = supabase.rpc('get_top_farmers', { limit_count: limit })

    // Filtrar por nivel si se especifica
    if (level) {
      query = query.eq('level', level)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching rankings:', error)
      return NextResponse.json(
        { error: 'Error al obtener rankings' },
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
