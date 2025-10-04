-- =====================================================
-- SISTEMA DE ROLES DE ADMINISTRADOR - BLOOMWATCH
-- =====================================================

-- Tabla: user_roles
-- Descripción: Define los roles de los usuarios (admin, farmer, researcher)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'farmer', 'researcher')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Cualquiera puede leer roles (para verificación)
CREATE POLICY "Anyone can read user roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Solo admins pueden insertar roles
CREATE POLICY "Only admins can insert roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Solo admins pueden actualizar roles
CREATE POLICY "Only admins can update roles"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Solo admins pueden eliminar roles
CREATE POLICY "Only admins can delete roles"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- FUNCIÓN HELPER: Verificar si un usuario es admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$;

-- =====================================================
-- TABLA DE AUDITORÍA: Registro de verificaciones
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contribution_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contribution_id UUID NOT NULL REFERENCES public.contributions(id) ON DELETE CASCADE,
    verified_by UUID NOT NULL REFERENCES auth.users(id),
    previous_status BOOLEAN NOT NULL,
    new_status BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_verification_contribution ON public.contribution_verifications(contribution_id);
CREATE INDEX IF NOT EXISTS idx_verification_verifier ON public.contribution_verifications(verified_by);
CREATE INDEX IF NOT EXISTS idx_verification_date ON public.contribution_verifications(created_at DESC);

-- RLS para tabla de auditoría
ALTER TABLE public.contribution_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins pueden leer verificaciones
CREATE POLICY "Admins can read verifications"
    ON public.contribution_verifications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins pueden insertar verificaciones
CREATE POLICY "Admins can insert verifications"
    ON public.contribution_verifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- DATOS INICIALES: Crear primer admin
-- =====================================================

-- IMPORTANTE: Ejecuta esta función para hacer admin a tu usuario
-- Reemplaza 'TU_EMAIL_AQUI' con tu email real

-- Función para crear admin (ejecutar manualmente)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'Error: Usuario no encontrado';
    END IF;
    
    -- Insertar rol de admin (ignorar si ya existe)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN 'Usuario ' || user_email || ' es ahora administrador';
END;
$$;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

-- 1. Ejecuta este archivo completo en Supabase SQL Editor
-- 2. Luego ejecuta esta función con tu email:
--    SELECT public.make_user_admin('tu-email@ejemplo.com');
-- 3. Refresca tu sesión en la app (logout/login)
-- 4. Ahora puedes acceder a /admin/contributions

-- Para verificar si eres admin:
-- SELECT public.is_admin(auth.uid());

-- Para ver todos los admins:
-- SELECT u.email, ur.granted_at 
-- FROM public.user_roles ur
-- JOIN auth.users u ON u.id = ur.user_id
-- WHERE ur.role = 'admin';
