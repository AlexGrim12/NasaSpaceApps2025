-- ============================================
-- SETUP SEGURO PARA PREDICCIONES - VERSIÓN 2
-- ============================================
-- Este script es seguro para ejecutar múltiples veces
-- Maneja conflictos de tablas y políticas existentes
-- ============================================

-- 1. VERIFICAR SI LAS TABLAS NECESARIAS EXISTEN
-- ============================================

-- Verificar que bloom_predictions existe (debe existir del setup anterior)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bloom_predictions') THEN
        RAISE EXCEPTION 'La tabla bloom_predictions no existe. Ejecuta primero farm-locations-schema.sql';
    END IF;
END $$;

-- 2. CREAR TABLAS NUEVAS (SOLO SI NO EXISTEN)
-- ============================================

-- Tabla para imágenes satelitales
CREATE TABLE IF NOT EXISTS public.satellite_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES public.bloom_predictions(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_path TEXT, -- Ruta en el bucket de Supabase
    description TEXT NOT NULL,
    requested_date DATE NOT NULL,
    image_date DATE NOT NULL,
    cloud_cover DECIMAL(5, 2) NOT NULL,
    image_type VARCHAR(50) DEFAULT 'satellite', -- 'satellite', 'ndvi', 'analysis'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para datos de análisis (métricas y gráficas)
CREATE TABLE IF NOT EXISTS public.prediction_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES public.bloom_predictions(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'training', 'timeline', 'phenology', 'precipitation', 'temperature'
    chart_data JSONB NOT NULL, -- Datos para las gráficas
    metrics JSONB, -- Métricas adicionales (MAE, RMSE, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR ÍNDICES (SOLO SI NO EXISTEN)
-- ============================================

-- Índices para imágenes satelitales
CREATE INDEX IF NOT EXISTS idx_satellite_images_prediction_id ON public.satellite_images(prediction_id);
CREATE INDEX IF NOT EXISTS idx_satellite_images_farmer_id ON public.satellite_images(farmer_id);
CREATE INDEX IF NOT EXISTS idx_satellite_images_date ON public.satellite_images(image_date DESC);

-- Índices para análisis
CREATE INDEX IF NOT EXISTS idx_prediction_analysis_prediction_id ON public.prediction_analysis(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_analysis_type ON public.prediction_analysis(analysis_type);

-- 4. CONFIGURAR ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE public.satellite_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_analysis ENABLE ROW LEVEL SECURITY;

-- 5. ELIMINAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- ============================================

-- Políticas para satellite_images
DROP POLICY IF EXISTS "Farmers can view own satellite images" ON public.satellite_images;
DROP POLICY IF EXISTS "Farmers can insert own satellite images" ON public.satellite_images;
DROP POLICY IF EXISTS "Farmers can delete own satellite images" ON public.satellite_images;

-- Políticas para prediction_analysis
DROP POLICY IF EXISTS "Farmers can view own analysis" ON public.prediction_analysis;
DROP POLICY IF EXISTS "Farmers can insert own analysis" ON public.prediction_analysis;
DROP POLICY IF EXISTS "Farmers can delete own analysis" ON public.prediction_analysis;

-- 6. CREAR POLÍTICAS RLS
-- ============================================

-- Políticas para satellite_images
CREATE POLICY "Farmers can view own satellite images"
    ON public.satellite_images
    FOR SELECT
    USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own satellite images"
    ON public.satellite_images
    FOR INSERT
    WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own satellite images"
    ON public.satellite_images
    FOR DELETE
    USING (auth.uid() = farmer_id);

-- Políticas para prediction_analysis
CREATE POLICY "Farmers can view own analysis"
    ON public.prediction_analysis
    FOR SELECT
    USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own analysis"
    ON public.prediction_analysis
    FOR INSERT
    WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own analysis"
    ON public.prediction_analysis
    FOR DELETE
    USING (auth.uid() = farmer_id);

-- 7. CONFIGURAR STORAGE BUCKET
-- ============================================

-- Crear bucket para imágenes satelitales si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('satellite-images', 'satellite-images', false)
ON CONFLICT (id) DO NOTHING;

-- 8. ELIMINAR POLÍTICAS DE STORAGE EXISTENTES
-- ============================================

DROP POLICY IF EXISTS "Farmers can upload satellite images" ON storage.objects;
DROP POLICY IF EXISTS "Farmers can view own satellite images" ON storage.objects;
DROP POLICY IF EXISTS "Farmers can delete own satellite images" ON storage.objects;

-- 9. CREAR POLÍTICAS DE STORAGE
-- ============================================

-- Política para subir imágenes
CREATE POLICY "Farmers can upload satellite images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para ver imágenes propias
CREATE POLICY "Farmers can view own satellite images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para eliminar imágenes propias
CREATE POLICY "Farmers can delete own satellite images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10. OTORGAR PERMISOS
-- ============================================

GRANT SELECT, INSERT, DELETE ON public.satellite_images TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.prediction_analysis TO authenticated;

-- 11. AGREGAR COMENTARIOS
-- ============================================

COMMENT ON TABLE public.satellite_images IS 'Imágenes satelitales asociadas a las predicciones de floración';
COMMENT ON TABLE public.prediction_analysis IS 'Datos de análisis y gráficas de las predicciones';
COMMENT ON COLUMN public.satellite_images.cloud_cover IS 'Porcentaje de cobertura de nubes (0-100)';
COMMENT ON COLUMN public.prediction_analysis.chart_data IS 'Datos JSON para generar las gráficas';

-- 12. VERIFICACIÓN FINAL
-- ============================================

-- Mostrar resumen de tablas creadas
DO $$
BEGIN
    RAISE NOTICE '✅ Setup completado exitosamente';
    RAISE NOTICE '📊 Tablas disponibles:';
    
    -- Verificar satellite_images
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'satellite_images') THEN
        RAISE NOTICE '  - ✅ satellite_images';
    ELSE
        RAISE NOTICE '  - ❌ satellite_images (ERROR)';
    END IF;
    
    -- Verificar prediction_analysis
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prediction_analysis') THEN
        RAISE NOTICE '  - ✅ prediction_analysis';
    ELSE
        RAISE NOTICE '  - ❌ prediction_analysis (ERROR)';
    END IF;
    
    -- Verificar bucket
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'satellite-images') THEN
        RAISE NOTICE '  - ✅ bucket: satellite-images';
    ELSE
        RAISE NOTICE '  - ❌ bucket: satellite-images (ERROR)';
    END IF;
    
    RAISE NOTICE '🚀 Sistema listo para usar!';
END $$;