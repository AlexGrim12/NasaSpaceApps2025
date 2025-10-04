import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/rankings/[id] - Obtener ranking de un agricultor específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: farmerId } = await params

    const { data, error } = await supabase
      .from('farmer_rankings')
      .select('*')
      .eq('farmer_id', farmerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Agricultor no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error fetching farmer ranking:', error)
      return NextResponse.json(
        { error: 'Error al obtener ranking del agricultor' },
        { status: 500 }
      )
    }

    // Obtener la posición en el ranking
    const { data: allRankings } = await supabase.rpc('get_top_farmers', {
      limit_count: 10000,
    })

    const position =
      allRankings?.findIndex(
        (r: { farmer_id: string }) => r.farmer_id === farmerId
      ) ?? -1

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        rank_position: position >= 0 ? position + 1 : null,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado del servidor' },
      { status: 500 }
    )
  }
}
