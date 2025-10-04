-- =====================================================
-- SISTEMA DE RANKING DE AGRICULTORES - BLOOMWATCH
-- Base de datos: Supabase PostgreSQL
-- =====================================================

-- Tabla: farmer_rankings
-- Descripción: Almacena el ranking y estadísticas de cada agricultor
CREATE TABLE IF NOT EXISTS public.farmer_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    level VARCHAR(50) DEFAULT 'Aprendiz' NOT NULL,
    contributions_count INTEGER DEFAULT 0 NOT NULL,
    drought_reports INTEGER DEFAULT 0 NOT NULL,
    pest_reports INTEGER DEFAULT 0 NOT NULL,
    sustainable_practices INTEGER DEFAULT 0 NOT NULL,
    crop_data_shared INTEGER DEFAULT 0 NOT NULL,
    weather_data_shared INTEGER DEFAULT 0 NOT NULL,
    badges JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(farmer_id)
);

-- Tabla: contributions
-- Descripción: Registra cada contribución realizada por los agricultores
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'drought_report', 
        'pest_report', 
        'sustainable_practice', 
        'crop_data', 
        'weather_data'
    )),
    points_earned INTEGER NOT NULL,
    description TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_farmer_rankings_points ON public.farmer_rankings(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_rankings_level ON public.farmer_rankings(level);
CREATE INDEX IF NOT EXISTS idx_farmer_rankings_farmer_id ON public.farmer_rankings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_contributions_farmer_id ON public.contributions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON public.contributions(type);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON public.contributions(created_at DESC);

-- Función: calculate_farmer_level
-- Descripción: Calcula el nivel del agricultor basado en sus puntos
CREATE OR REPLACE FUNCTION calculate_farmer_level(points INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    IF points >= 10000 THEN RETURN 'Leyenda del Campo';
    ELSIF points >= 5000 THEN RETURN 'Gran Maestro';
    ELSIF points >= 1500 THEN RETURN 'Maestro Agricultor';
    ELSIF points >= 500 THEN RETURN 'Agricultor Experimentado';
    ELSIF points >= 100 THEN RETURN 'Cultivador';
    ELSE RETURN 'Aprendiz';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: update_farmer_ranking
-- Descripción: Actualiza el ranking del agricultor después de una contribución
CREATE OR REPLACE FUNCTION update_farmer_ranking()
RETURNS TRIGGER AS $$
DECLARE
    v_points INTEGER;
    v_new_level VARCHAR(50);
BEGIN
    -- Calcular puntos totales
    SELECT COALESCE(SUM(points_earned), 0)
    INTO v_points
    FROM contributions
    WHERE farmer_id = NEW.farmer_id AND verified = true;

    -- Calcular nivel
    v_new_level := calculate_farmer_level(v_points);

    -- Actualizar o insertar ranking
    INSERT INTO farmer_rankings (
        farmer_id,
        farmer_name,
        total_points,
        level,
        contributions_count,
        drought_reports,
        pest_reports,
        sustainable_practices,
        crop_data_shared,
        weather_data_shared,
        updated_at
    )
    SELECT
        NEW.farmer_id,
        COALESCE(u.raw_user_meta_data->>'name', u.email),
        v_points,
        v_new_level,
        COUNT(*),
        COUNT(*) FILTER (WHERE type = 'drought_report'),
        COUNT(*) FILTER (WHERE type = 'pest_report'),
        COUNT(*) FILTER (WHERE type = 'sustainable_practice'),
        COUNT(*) FILTER (WHERE type = 'crop_data'),
        COUNT(*) FILTER (WHERE type = 'weather_data'),
        NOW()
    FROM contributions c
    JOIN auth.users u ON u.id = NEW.farmer_id
    WHERE c.farmer_id = NEW.farmer_id AND c.verified = true
    GROUP BY NEW.farmer_id, u.raw_user_meta_data, u.email
    ON CONFLICT (farmer_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        level = EXCLUDED.level,
        contributions_count = EXCLUDED.contributions_count,
        drought_reports = EXCLUDED.drought_reports,
        pest_reports = EXCLUDED.pest_reports,
        sustainable_practices = EXCLUDED.sustainable_practices,
        crop_data_shared = EXCLUDED.crop_data_shared,
        weather_data_shared = EXCLUDED.weather_data_shared,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: actualizar ranking cuando se verifica una contribución
DROP TRIGGER IF EXISTS trigger_update_ranking ON contributions;
CREATE TRIGGER trigger_update_ranking
    AFTER INSERT OR UPDATE OF verified ON contributions
    FOR EACH ROW
    WHEN (NEW.verified = true)
    EXECUTE FUNCTION update_farmer_ranking();

-- Función: get_top_farmers
-- Descripción: Obtiene el top de agricultores con su posición en el ranking
CREATE OR REPLACE FUNCTION get_top_farmers(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    farmer_id UUID,
    farmer_name VARCHAR,
    total_points INTEGER,
    level VARCHAR,
    contributions_count INTEGER,
    drought_reports INTEGER,
    pest_reports INTEGER,
    sustainable_practices INTEGER,
    crop_data_shared INTEGER,
    weather_data_shared INTEGER,
    badges JSONB,
    avatar_url TEXT,
    location VARCHAR,
    rank_position BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fr.id,
        fr.farmer_id,
        fr.farmer_name,
        fr.total_points,
        fr.level,
        fr.contributions_count,
        fr.drought_reports,
        fr.pest_reports,
        fr.sustainable_practices,
        fr.crop_data_shared,
        fr.weather_data_shared,
        fr.badges,
        fr.avatar_url,
        fr.location,
        ROW_NUMBER() OVER (ORDER BY fr.total_points DESC, fr.updated_at ASC) as rank_position,
        fr.created_at,
        fr.updated_at
    FROM farmer_rankings fr
    ORDER BY fr.total_points DESC, fr.updated_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (Row Level Security)
ALTER TABLE public.farmer_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer los rankings (dashboard público)
CREATE POLICY "Rankings son públicos" ON public.farmer_rankings
    FOR SELECT USING (true);

-- Política: Solo los agricultores pueden crear sus propias contribuciones
CREATE POLICY "Los agricultores pueden crear sus contribuciones" ON public.contributions
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- Política: Cualquiera puede ver contribuciones verificadas
CREATE POLICY "Contribuciones verificadas son públicas" ON public.contributions
    FOR SELECT USING (verified = true);

-- Política: Solo el dueño puede ver sus contribuciones no verificadas
CREATE POLICY "Ver propias contribuciones no verificadas" ON public.contributions
    FOR SELECT USING (auth.uid() = farmer_id);

-- Función auxiliar: actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_farmer_rankings_updated_at ON farmer_rankings;
CREATE TRIGGER update_farmer_rankings_updated_at
    BEFORE UPDATE ON farmer_rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contributions_updated_at ON contributions;
CREATE TRIGGER update_contributions_updated_at
    BEFORE UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- =====================================================

-- Insertar algunos agricultores de ejemplo
-- NOTA: Debes tener usuarios reales en auth.users primero
-- Descomenta y ajusta los UUIDs según tus usuarios

/*
INSERT INTO farmer_rankings (farmer_id, farmer_name, total_points, level, location) VALUES
    ('uuid-1', 'Juan Pérez', 5200, 'Gran Maestro', 'Jalisco, México'),
    ('uuid-2', 'María González', 3800, 'Maestro Agricultor', 'Sinaloa, México'),
    ('uuid-3', 'Carlos Rodríguez', 2100, 'Maestro Agricultor', 'Michoacán, México')
ON CONFLICT (farmer_id) DO NOTHING;
*/

-- =====================================================
-- QUERIES ÚTILES PARA CONSULTAS
-- =====================================================

-- Ver top 10 agricultores con su posición
-- SELECT * FROM get_top_farmers(10);

-- Ver contribuciones de un agricultor específico
-- SELECT * FROM contributions WHERE farmer_id = 'uuid-aqui' ORDER BY created_at DESC;

-- Ver estadísticas generales
-- SELECT 
--     COUNT(DISTINCT farmer_id) as total_farmers,
--     SUM(contributions_count) as total_contributions,
--     AVG(total_points) as avg_points,
--     MAX(total_points) as max_points
-- FROM farmer_rankings;
