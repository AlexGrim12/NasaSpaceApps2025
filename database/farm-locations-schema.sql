-- ============================================
-- ESQUEMA PARA UBICACIONES DE PARCELAS
-- ============================================
-- Este esquema permite a los agricultores guardar
-- las coordenadas de sus parcelas para análisis
-- de predicción de floración
-- ============================================

-- Tabla para ubicaciones de parcelas
CREATE TABLE IF NOT EXISTS public.farm_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    hectares DECIMAL(10, 2),
    crop_variety VARCHAR(100),
    planting_date DATE,
    expected_bloom_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_farm_locations_farmer_id ON public.farm_locations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_locations_coordinates ON public.farm_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_farm_locations_created_at ON public.farm_locations(created_at DESC);

-- Tabla para predicciones de floración guardadas
CREATE TABLE IF NOT EXISTS public.bloom_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.farm_locations(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_date DATE NOT NULL,
    predicted_bloom_date DATE NOT NULL,
    days_to_bloom INTEGER NOT NULL,
    gdc_accumulated DECIMAL(10, 2),
    ndvi_value DECIMAL(5, 3),
    confidence_score DECIMAL(5, 2),
    temperature_avg DECIMAL(5, 2),
    precipitation_total DECIMAL(10, 2),
    model_version VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para predicciones
CREATE INDEX IF NOT EXISTS idx_bloom_predictions_location_id ON public.bloom_predictions(location_id);
CREATE INDEX IF NOT EXISTS idx_bloom_predictions_farmer_id ON public.bloom_predictions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bloom_predictions_date ON public.bloom_predictions(prediction_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE public.farm_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloom_predictions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Farmers can view own locations" ON public.farm_locations;
DROP POLICY IF EXISTS "Farmers can insert own locations" ON public.farm_locations;
DROP POLICY IF EXISTS "Farmers can update own locations" ON public.farm_locations;
DROP POLICY IF EXISTS "Farmers can delete own locations" ON public.farm_locations;
DROP POLICY IF EXISTS "Farmers can view own predictions" ON public.bloom_predictions;
DROP POLICY IF EXISTS "Farmers can insert own predictions" ON public.bloom_predictions;
DROP POLICY IF EXISTS "Farmers can delete own predictions" ON public.bloom_predictions;

-- Políticas para farm_locations
-- Los agricultores solo pueden ver sus propias ubicaciones
CREATE POLICY "Farmers can view own locations"
    ON public.farm_locations
    FOR SELECT
    USING (auth.uid() = farmer_id);

-- Los agricultores pueden insertar sus propias ubicaciones
-- Nota: Se permite insertar si el farmer_id coincide con el usuario autenticado
CREATE POLICY "Farmers can insert own locations"
    ON public.farm_locations
    FOR INSERT
    WITH CHECK (auth.uid() = farmer_id);

-- Los agricultores pueden actualizar sus propias ubicaciones
CREATE POLICY "Farmers can update own locations"
    ON public.farm_locations
    FOR UPDATE
    USING (auth.uid() = farmer_id)
    WITH CHECK (auth.uid() = farmer_id);

-- Los agricultores pueden eliminar sus propias ubicaciones
CREATE POLICY "Farmers can delete own locations"
    ON public.farm_locations
    FOR DELETE
    USING (auth.uid() = farmer_id);

-- Políticas para bloom_predictions
-- Los agricultores solo pueden ver sus propias predicciones
CREATE POLICY "Farmers can view own predictions"
    ON public.bloom_predictions
    FOR SELECT
    USING (auth.uid() = farmer_id);

-- Los agricultores pueden insertar sus propias predicciones
CREATE POLICY "Farmers can insert own predictions"
    ON public.bloom_predictions
    FOR INSERT
    WITH CHECK (auth.uid() = farmer_id);

-- Los agricultores pueden eliminar sus propias predicciones
CREATE POLICY "Farmers can delete own predictions"
    ON public.bloom_predictions
    FOR DELETE
    USING (auth.uid() = farmer_id);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para farm_locations
DROP TRIGGER IF EXISTS update_farm_locations_updated_at ON public.farm_locations;
CREATE TRIGGER update_farm_locations_updated_at
    BEFORE UPDATE ON public.farm_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Función para calcular distancia entre dos coordenadas (en km)
-- Fórmula de Haversine
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Radio de la Tierra en km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    a := SIN(dLat/2) * SIN(dLat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dLon/2) * SIN(dLon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vista para estadísticas de ubicaciones por agricultor
CREATE OR REPLACE VIEW public.farmer_location_stats AS
SELECT
    fl.farmer_id,
    fr.farmer_name,
    COUNT(DISTINCT fl.id) as total_locations,
    SUM(fl.hectares) as total_hectares,
    COUNT(DISTINCT bp.id) as total_predictions,
    MAX(bp.prediction_date) as last_prediction_date
FROM public.farm_locations fl
LEFT JOIN public.farmer_rankings fr ON fl.farmer_id = fr.farmer_id
LEFT JOIN public.bloom_predictions bp ON fl.id = bp.location_id
GROUP BY fl.farmer_id, fr.farmer_name;

-- ============================================
-- DATOS DE EJEMPLO (COMENTADOS)
-- ============================================

-- Descomentar para insertar datos de ejemplo
/*
-- Ubicaciones de ejemplo para agricultor con ID '123e4567-e89b-12d3-a456-426614174000'
INSERT INTO public.farm_locations (farmer_id, name, description, latitude, longitude, hectares, crop_variety, planting_date) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Parcela Norte', 'Terreno principal cerca del río', 20.6736, -103.3444, 25.5, 'Híbrido H-70', '2024-05-15'),
('123e4567-e89b-12d3-a456-426614174000', 'Parcela Sur', 'Zona con mejor drenaje', 20.6580, -103.3520, 18.0, 'Criollo Tepatiteco', '2024-05-20'),
('123e4567-e89b-12d3-a456-426614174000', 'Parcela Este', 'Terreno experimental', 20.6690, -103.3350, 12.3, 'Híbrido H-52', '2024-06-01');

-- Predicción de ejemplo
INSERT INTO public.bloom_predictions (
    location_id,
    farmer_id,
    analysis_date,
    predicted_bloom_date,
    days_to_bloom,
    gdc_accumulated,
    ndvi_value,
    confidence_score,
    temperature_avg,
    precipitation_total,
    model_version
)
SELECT
    id,
    farmer_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days',
    45,
    850.5,
    0.725,
    87.3,
    24.5,
    125.8,
    'LSTM-v1.0'
FROM public.farm_locations
WHERE name = 'Parcela Norte'
LIMIT 1;
*/

-- ============================================
-- GRANTS (Permisos)
-- ============================================

-- Asegurar que los usuarios autenticados puedan acceder
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_locations TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bloom_predictions TO authenticated;
GRANT SELECT ON public.farmer_location_stats TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.farm_locations IS 'Ubicaciones de parcelas/campos de los agricultores con coordenadas GPS';
COMMENT ON TABLE public.bloom_predictions IS 'Registro histórico de predicciones de floración realizadas';
COMMENT ON COLUMN public.farm_locations.latitude IS 'Latitud en grados decimales (-90 a 90)';
COMMENT ON COLUMN public.farm_locations.longitude IS 'Longitud en grados decimales (-180 a 180)';
COMMENT ON COLUMN public.bloom_predictions.confidence_score IS 'Puntuación de confianza del modelo (0-100)';
COMMENT ON FUNCTION public.calculate_distance IS 'Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine';
