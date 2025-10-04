// =====================================================
// API ENDPOINT: Verificar Contribución (Admin Only)
// PATCH /api/admin/contributions/[id]/verify
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contributionId } = await params

    // 1. Verificar autenticación
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
        { error: 'No autorizado. Sesión inválida.' },
        { status: 401 }
      )
    }

    // 2. Verificar que el usuario es admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      return NextResponse.json(
        {
          error:
            'Acceso denegado. Solo administradores pueden verificar contribuciones.',
        },
        { status: 403 }
      )
    }

    // 3. Obtener datos del body
    const body = await request.json()
    const { verified, notes } = body

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo "verified" es requerido y debe ser boolean' },
        { status: 400 }
      )
    }

    // 4. Obtener estado actual de la contribución
    const { data: contribution, error: fetchError } = await supabaseAdmin
      .from('contributions')
      .select('*, farmer_id')
      .eq('id', contributionId)
      .single()

    if (fetchError || !contribution) {
      return NextResponse.json(
        { error: 'Contribución no encontrada' },
        { status: 404 }
      )
    }

    const previousStatus = contribution.verified

    // 5. Actualizar estado de verificación usando admin client
    const { data: updatedContribution, error: updateError } =
      await supabaseAdmin
        .from('contributions')
        .update({
          verified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contributionId)
        .select()
        .single()

    if (updateError) {
      console.error('Error updating contribution:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la contribución' },
        { status: 500 }
      )
    }

    // 6. Registrar en tabla de auditoría
    const { error: auditError } = await supabaseAdmin
      .from('contribution_verifications')
      .insert({
        contribution_id: contributionId,
        verified_by: user.id,
        previous_status: previousStatus,
        new_status: verified,
        notes: notes || null,
      })

    if (auditError) {
      console.error('Error creating audit log:', auditError)
      // No falla la operación, solo registra el error
    }

    // 7. Si se verifica la contribución, actualizar ranking del agricultor
    // El trigger en la BD ya hace esto automáticamente
    // Pero podemos forzar una actualización manual si es necesario
    if (verified && !previousStatus) {
      // La contribución pasó de no verificada a verificada
      const { error: rankingError } = await supabaseAdmin.rpc(
        'update_farmer_ranking',
        {
          p_farmer_id: contribution.farmer_id,
        }
      )

      if (rankingError) {
        console.error('Error updating farmer ranking:', rankingError)
        // No falla la operación, el trigger debería manejarlo
      }
    }

    return NextResponse.json({
      success: true,
      message: verified
        ? 'Contribución verificada exitosamente'
        : 'Verificación removida exitosamente',
      data: updatedContribution,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener historial de verificaciones de una contribución
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contributionId } = await params

    // Verificar autenticación y rol admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar rol admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener historial de verificaciones
    const { data, error } = await supabase
      .from('contribution_verifications')
      .select(
        `
        *,
        verifier:verified_by (
          email,
          raw_user_meta_data
        )
      `
      )
      .eq('contribution_id', contributionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching verification history:', error)
      return NextResponse.json(
        { error: 'Error al obtener historial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 })
  }
}
