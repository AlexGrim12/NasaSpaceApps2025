-- ============================================
-- ESQUEMA PARA IMÁGENES SATELITALES
-- ============================================
-- Este esquema permite guardar las imágenes satelitales
-- asociadas a las predicciones de floración
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

-- Índices para imágenes satelitales
CREATE INDEX IF NOT EXISTS idx_satellite_images_prediction_id ON public.satellite_images(prediction_id);
CREATE INDEX IF NOT EXISTS idx_satellite_images_farmer_id ON public.satellite_images(farmer_id);
CREATE INDEX IF NOT EXISTS idx_satellite_images_date ON public.satellite_images(image_date DESC);

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

-- Índices para análisis
CREATE INDEX IF NOT EXISTS idx_prediction_analysis_prediction_id ON public.prediction_analysis(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_analysis_type ON public.prediction_analysis(analysis_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE public.satellite_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_analysis ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- STORAGE BUCKET PARA IMÁGENES
-- ============================================

-- Crear bucket para imágenes satelitales si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('satellite-images', 'satellite-images', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para el bucket
CREATE POLICY "Farmers can upload satellite images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Farmers can view own satellite images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Farmers can delete own satellite images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'satellite-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- GRANTS (Permisos)
-- ============================================

GRANT SELECT, INSERT, DELETE ON public.satellite_images TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.prediction_analysis TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.satellite_images IS 'Imágenes satelitales asociadas a las predicciones de floración';
COMMENT ON TABLE public.prediction_analysis IS 'Datos de análisis y gráficas de las predicciones';
COMMENT ON COLUMN public.satellite_images.cloud_cover IS 'Porcentaje de cobertura de nubes (0-100)';
COMMENT ON COLUMN public.prediction_analysis.chart_data IS 'Datos JSON para generar las gráficas';