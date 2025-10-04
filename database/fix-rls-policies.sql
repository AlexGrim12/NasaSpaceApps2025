-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA API ROUTES
-- =====================================================

-- PROBLEMA: Las API routes usan el cliente anon de Supabase,
-- pero las políticas RLS actuales no permiten INSERT desde API routes.

-- SOLUCIÓN: Actualizar las políticas para permitir operaciones
-- cuando el usuario está autenticado (JWT válido).

-- =====================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- =====================================================

-- Eliminar políticas de contributions
DROP POLICY IF EXISTS "Usuarios pueden crear sus propias contribuciones" ON contributions;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias contribuciones" ON contributions;
DROP POLICY IF EXISTS "Todos pueden ver contribuciones verificadas" ON contributions;
DROP POLICY IF EXISTS "public_contributions_select" ON contributions;

-- Eliminar políticas de farmer_rankings  
DROP POLICY IF EXISTS "Todos pueden ver rankings" ON farmer_rankings;
DROP POLICY IF EXISTS "public_farmer_rankings_select" ON farmer_rankings;

-- =====================================================
-- 2. CREAR POLÍTICAS CORRECTAS PARA CONTRIBUTIONS
-- =====================================================

-- Política para SELECT: Todos pueden ver contribuciones verificadas
CREATE POLICY "select_verified_contributions"
ON contributions
FOR SELECT
USING (verified = true OR auth.uid() = farmer_id);

-- Política para INSERT: Usuarios autenticados pueden crear sus propias contribuciones
CREATE POLICY "insert_own_contributions"
ON contributions
FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

-- Política para UPDATE: Solo admins o el mismo usuario
CREATE POLICY "update_own_contributions"
ON contributions
FOR UPDATE
USING (auth.uid() = farmer_id);

-- =====================================================
-- 3. CREAR POLÍTICAS CORRECTAS PARA FARMER_RANKINGS
-- =====================================================

-- Política para SELECT: Todos pueden ver todos los rankings (es público)
CREATE POLICY "select_all_farmer_rankings"
ON farmer_rankings
FOR SELECT
USING (true);

-- Política para INSERT: Sistema puede crear rankings (triggers)
-- Esta política es para el trigger que crea automáticamente el ranking
CREATE POLICY "insert_farmer_rankings"
ON farmer_rankings
FOR INSERT
WITH CHECK (true);

-- Política para UPDATE: Sistema puede actualizar rankings (triggers)
CREATE POLICY "update_farmer_rankings"
ON farmer_rankings
FOR UPDATE
USING (true);

-- =====================================================
-- 4. HABILITAR RLS EN LAS TABLAS
-- =====================================================

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_rankings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VERIFICAR POLÍTICAS
-- =====================================================

-- Ver políticas de contributions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contributions';

-- Ver políticas de farmer_rankings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'farmer_rankings';

-- =====================================================
-- 6. TESTING - PROBAR POLÍTICAS
-- =====================================================

-- Como usuario autenticado, debería poder:
-- 1. Ver contribuciones verificadas
-- 2. Ver sus propias contribuciones (verificadas o no)
-- 3. Crear sus propias contribuciones
-- 4. Ver todos los rankings

-- Ejemplo de test (ejecutar después de autenticarte):
/*
-- Crear una contribución de prueba
INSERT INTO contributions (
    farmer_id, 
    type, 
    points_earned, 
    description, 
    verified
) VALUES (
    auth.uid(),  -- Tu UUID automáticamente
    'drought_report',
    50,
    'Prueba de contribución desde API',
    false
);

-- Verificar que se creó
SELECT * FROM contributions WHERE farmer_id = auth.uid();

-- Ver tu ranking (debería existir automáticamente por el trigger)
SELECT * FROM farmer_rankings WHERE farmer_id = auth.uid();
*/

-- =====================================================
-- 7. ALTERNATIVA: BYPASS RLS EN API ROUTES
-- =====================================================

-- Si las políticas anteriores no funcionan, puedes usar el service_role key
-- en lugar del anon key en tus API routes.

-- IMPORTANTE: Solo para API routes, NUNCA en el cliente.

-- En tu código de API route:
/*
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Este cliente bypasa RLS
const { data, error } = await supabaseAdmin
  .from('contributions')
  .insert({ ... })
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Las políticas RLS protegen tus datos a nivel de base de datos
2. auth.uid() devuelve el UUID del usuario autenticado desde el JWT
3. Los triggers funcionan independientemente de RLS
4. El service_role key bypasa RLS (usar con cuidado)
5. Siempre prueba las políticas antes de deploy a producción
*/

-- =====================================================
-- ROLLBACK (SI ALGO SALE MAL)
-- =====================================================

/*
-- Para deshabilitar RLS temporalmente:
ALTER TABLE contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_rankings DISABLE ROW LEVEL SECURITY;

-- Para eliminar todas las políticas:
DROP POLICY IF EXISTS "select_verified_contributions" ON contributions;
DROP POLICY IF EXISTS "insert_own_contributions" ON contributions;
DROP POLICY IF EXISTS "update_own_contributions" ON contributions;
DROP POLICY IF EXISTS "select_all_farmer_rankings" ON farmer_rankings;
DROP POLICY IF EXISTS "insert_farmer_rankings" ON farmer_rankings;
DROP POLICY IF EXISTS "update_farmer_rankings" ON farmer_rankings;
*/
