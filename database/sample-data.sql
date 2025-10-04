-- =====================================================
-- DATOS DE EJEMPLO PARA SISTEMA DE RANKING
-- Solo para desarrollo y demostración
-- =====================================================

-- NOTA: Este archivo es para propósitos de demostración.
-- En producción, los datos reales se generarán a través de la aplicación.

-- =====================================================
-- IMPORTANTE: Reemplaza los UUIDs con IDs reales de tu tabla auth.users
-- =====================================================

-- Paso 1: Primero necesitas tener usuarios en auth.users
-- Puedes crearlos desde la aplicación en /auth/register
-- O manualmente en Supabase Dashboard

-- Paso 2: Obtén los UUIDs de tus usuarios
-- SELECT id, email FROM auth.users;

-- =====================================================
-- EJEMPLO DE CONTRIBUCIONES
-- =====================================================

-- Reemplaza 'USER_UUID_1', 'USER_UUID_2', etc. con UUIDs reales

-- Usuario 1: Juan Pérez (Gran Maestro)
-- Supongamos que su UUID es: '123e4567-e89b-12d3-a456-426614174000'

INSERT INTO contributions (farmer_id, type, points_earned, description, verified, metadata, created_at) VALUES
-- Reportes de Sequías (25 reportes x 50 pts = 1,250 pts)
('123e4567-e89b-12d3-a456-426614174000', 'drought_report', 50, 'Sequía severa detectada en zona norte de Jalisco. Precipitaciones 40% por debajo del promedio.', true, '{"location": {"state": "Jalisco", "municipality": "Tepatitlán"}, "severity": "high", "affected_hectares": 150}', NOW() - INTERVAL '90 days'),
('123e4567-e89b-12d3-a456-426614174000', 'drought_report', 50, 'Continuación de periodo seco. Cultivos necesitan riego de emergencia.', true, '{"location": {"state": "Jalisco", "municipality": "Tepatitlán"}, "severity": "high"}', NOW() - INTERVAL '85 days'),
('123e4567-e89b-12d3-a456-426614174000', 'drought_report', 50, 'Mejora parcial en condiciones de humedad tras lluvias ligeras.', true, '{"location": {"state": "Jalisco", "municipality": "Tepatitlán"}, "severity": "moderate"}', NOW() - INTERVAL '80 days'),
-- Agregar 22 más para llegar a 25...
('123e4567-e89b-12d3-a456-426614174000', 'drought_report', 50, 'Nueva sequía detectada en zona este.', true, '{"location": {"state": "Jalisco"}, "severity": "moderate"}', NOW() - INTERVAL '75 days'),

-- Reportes de Plagas (30 reportes x 40 pts = 1,200 pts)
('123e4567-e89b-12d3-a456-426614174000', 'pest_report', 40, 'Gusano cogollero detectado en parcela 5. Afectación moderada.', true, '{"pest_type": "Spodoptera frugiperda", "severity": "moderate", "affected_hectares": 30}', NOW() - INTERVAL '70 days'),
('123e4567-e89b-12d3-a456-426614174000', 'pest_report', 40, 'Presencia de áfidos en cultivo de maíz. Tratamiento aplicado.', true, '{"pest_type": "Aphids", "severity": "low", "treatment": "organic_pesticide"}', NOW() - INTERVAL '65 days'),
-- Agregar 28 más para llegar a 30...

-- Prácticas Sostenibles (20 reportes x 60 pts = 1,200 pts)
('123e4567-e89b-12d3-a456-426614174000', 'sustainable_practice', 60, 'Implementación de sistema de riego por goteo. Ahorro estimado de 40% de agua.', true, '{"practice_type": "water_conservation", "investment": 50000, "expected_savings": "40%"}', NOW() - INTERVAL '60 days'),
('123e4567-e89b-12d3-a456-426614174000', 'sustainable_practice', 60, 'Uso de fertilizantes orgánicos y compostaje.', true, '{"practice_type": "organic_fertilizer"}', NOW() - INTERVAL '55 days'),
-- Agregar 18 más para llegar a 20...

-- Datos de Cultivo (20 reportes x 30 pts = 600 pts)
('123e4567-e89b-12d3-a456-426614174000', 'crop_data', 30, 'Cosecha de maíz: 8 toneladas por hectárea. Variedad H-565.', true, '{"yield": 8, "crop_type": "maíz", "variety": "H-565", "hectares": 50}', NOW() - INTERVAL '50 days'),
('123e4567-e89b-12d3-a456-426614174000', 'crop_data', 30, 'Siembra completada. Variedad resistente a sequía.', true, '{"crop_type": "maíz", "variety": "drought_resistant", "hectares": 60}', NOW() - INTERVAL '45 days'),
-- Agregar 18 más para llegar a 20...

-- Datos Climáticos (9 reportes x 20 pts = 180 pts)
('123e4567-e89b-12d3-a456-426614174000', 'weather_data', 20, 'Temperatura máxima: 35°C, Precipitación: 0mm, Humedad: 45%', true, '{"temp_max": 35, "temp_min": 22, "precipitation": 0, "humidity": 45}', NOW() - INTERVAL '40 days'),
('123e4567-e89b-12d3-a456-426614174000', 'weather_data', 20, 'Lluvia registrada: 15mm. Temperatura promedio: 28°C', true, '{"temp_max": 30, "temp_min": 26, "precipitation": 15, "humidity": 70}', NOW() - INTERVAL '35 days'),
-- Agregar 7 más para llegar a 9...

-- Total estimado para Juan: 1,250 + 1,200 + 1,200 + 600 + 180 = 4,430 pts
-- Nivel: Maestro Agricultor (casi Gran Maestro)

-- =====================================================
-- Usuario 2: María González (Maestro Agricultor)
-- Supongamos que su UUID es: '234e5678-e89b-12d3-a456-426614174001'

-- Agregar 60 contribuciones variadas que sumen ~3,800 puntos

INSERT INTO contributions (farmer_id, type, points_earned, description, verified, metadata, created_at) VALUES
('234e5678-e89b-12d3-a456-426614174001', 'sustainable_practice', 60, 'Rotación de cultivos implementada exitosamente.', true, '{"practice_type": "crop_rotation"}', NOW() - INTERVAL '120 days'),
('234e5678-e89b-12d3-a456-426614174001', 'pest_report', 40, 'Detección temprana de gusano elotero.', true, '{"pest_type": "Helicoverpa zea", "severity": "low"}', NOW() - INTERVAL '115 days'),
('234e5678-e89b-12d3-a456-426614174001', 'drought_report', 50, 'Sequía moderada en zona centro.', true, '{"location": {"state": "Sinaloa"}, "severity": "moderate"}', NOW() - INTERVAL '110 days'),
-- Agregar más contribuciones para llegar a 3,800 pts...

-- =====================================================
-- Usuario 3: Carlos Rodríguez (Agricultor Experimentado)
-- UUID: '345e6789-e89b-12d3-a456-426614174002'

INSERT INTO contributions (farmer_id, type, points_earned, description, verified, metadata, created_at) VALUES
('345e6789-e89b-12d3-a456-426614174002', 'crop_data', 30, 'Datos de producción del ciclo primavera-verano.', true, '{"yield": 7.5, "hectares": 40}', NOW() - INTERVAL '100 days'),
('345e6789-e89b-12d3-a456-426614174002', 'weather_data', 20, 'Registro diario de temperatura y humedad.', true, '{"temp_max": 33, "humidity": 55}', NOW() - INTERVAL '95 days'),
-- Agregar más contribuciones para llegar a ~2,100 pts...

-- =====================================================
-- SCRIPT PARA GENERAR MÚLTIPLES CONTRIBUCIONES
-- =====================================================

-- Función para facilitar la inserción de múltiples contribuciones
CREATE OR REPLACE FUNCTION insert_sample_contributions(
    p_farmer_id UUID,
    p_type VARCHAR,
    p_count INTEGER
) RETURNS void AS $$
DECLARE
    i INTEGER;
    v_points INTEGER;
    v_descriptions TEXT[];
BEGIN
    -- Determinar puntos según tipo
    CASE p_type
        WHEN 'drought_report' THEN 
            v_points := 50;
            v_descriptions := ARRAY[
                'Sequía detectada en parcela norte',
                'Condiciones de sequía continúan',
                'Mejora parcial en condiciones hídricas',
                'Nueva zona afectada por sequía',
                'Sequía severa requiere atención'
            ];
        WHEN 'pest_report' THEN 
            v_points := 40;
            v_descriptions := ARRAY[
                'Plaga detectada en cultivo',
                'Nueva infestación reportada',
                'Control de plagas aplicado',
                'Monitoreo continuo de plagas',
                'Plaga bajo control'
            ];
        WHEN 'sustainable_practice' THEN 
            v_points := 60;
            v_descriptions := ARRAY[
                'Práctica sostenible implementada',
                'Uso de métodos orgánicos',
                'Conservación de recursos',
                'Mejora en sostenibilidad',
                'Nueva técnica ecológica aplicada'
            ];
        WHEN 'crop_data' THEN 
            v_points := 30;
            v_descriptions := ARRAY[
                'Datos de cosecha registrados',
                'Información de siembra compartida',
                'Rendimiento del cultivo documentado',
                'Estadísticas de producción',
                'Datos agronómicos actualizados'
            ];
        WHEN 'weather_data' THEN 
            v_points := 20;
            v_descriptions := ARRAY[
                'Datos meteorológicos registrados',
                'Lecturas de temperatura y humedad',
                'Precipitación documentada',
                'Condiciones climáticas reportadas',
                'Información climática actualizada'
            ];
    END CASE;

    -- Insertar contribuciones
    FOR i IN 1..p_count LOOP
        INSERT INTO contributions (
            farmer_id, 
            type, 
            points_earned, 
            description, 
            verified, 
            created_at
        ) VALUES (
            p_farmer_id,
            p_type,
            v_points,
            v_descriptions[1 + (i % array_length(v_descriptions, 1))],
            true,
            NOW() - (i || ' days')::INTERVAL
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAR LA FUNCIÓN PARA GENERAR DATOS
-- =====================================================

-- Ejemplo: Generar contribuciones para Juan Pérez
-- Reemplaza con UUID real
/*
SELECT insert_sample_contributions('123e4567-e89b-12d3-a456-426614174000', 'drought_report', 25);
SELECT insert_sample_contributions('123e4567-e89b-12d3-a456-426614174000', 'pest_report', 30);
SELECT insert_sample_contributions('123e4567-e89b-12d3-a456-426614174000', 'sustainable_practice', 20);
SELECT insert_sample_contributions('123e4567-e89b-12d3-a456-426614174000', 'crop_data', 20);
SELECT insert_sample_contributions('123e4567-e89b-12d3-a456-426614174000', 'weather_data', 9);

-- Verificar que se crearon correctamente
SELECT farmer_id, type, COUNT(*), SUM(points_earned) as total_points
FROM contributions
WHERE farmer_id = '123e4567-e89b-12d3-a456-426614174000' AND verified = true
GROUP BY farmer_id, type;

-- Ver el ranking actualizado
SELECT * FROM get_top_farmers(10);
*/

-- =====================================================
-- SCRIPT PARA LIMPIAR DATOS DE PRUEBA
-- =====================================================

-- CUIDADO: Esto eliminará TODAS las contribuciones y rankings
/*
TRUNCATE TABLE contributions CASCADE;
TRUNCATE TABLE farmer_rankings CASCADE;
*/

-- Para eliminar solo contribuciones de un usuario específico:
/*
DELETE FROM contributions WHERE farmer_id = 'UUID_AQUI';
DELETE FROM farmer_rankings WHERE farmer_id = 'UUID_AQUI';
*/

-- =====================================================
-- VERIFICACIONES ÚTILES
-- =====================================================

-- Ver resumen de un agricultor
/*
SELECT 
    fr.farmer_name,
    fr.total_points,
    fr.level,
    fr.rank_position,
    fr.contributions_count,
    fr.drought_reports,
    fr.pest_reports,
    fr.sustainable_practices,
    fr.crop_data_shared,
    fr.weather_data_shared
FROM get_top_farmers(100) fr
WHERE fr.farmer_id = 'UUID_AQUI';
*/

-- Ver todas las contribuciones de un agricultor
/*
SELECT 
    type,
    points_earned,
    description,
    verified,
    created_at
FROM contributions
WHERE farmer_id = 'UUID_AQUI'
ORDER BY created_at DESC;
*/

-- Estadísticas generales
/*
SELECT 
    COUNT(DISTINCT farmer_id) as total_agricultores,
    COUNT(*) as total_contribuciones,
    SUM(CASE WHEN verified THEN 1 ELSE 0 END) as contribuciones_verificadas,
    SUM(CASE WHEN verified THEN points_earned ELSE 0 END) as puntos_totales
FROM contributions;
*/

-- Distribución por nivel
/*
SELECT 
    level,
    COUNT(*) as cantidad_agricultores,
    AVG(total_points) as puntos_promedio,
    MIN(total_points) as puntos_minimos,
    MAX(total_points) as puntos_maximos
FROM farmer_rankings
GROUP BY level
ORDER BY MIN(total_points);
*/

-- Top 10 por tipo de contribución
/*
-- Top en sequías
SELECT farmer_name, drought_reports, total_points
FROM farmer_rankings
ORDER BY drought_reports DESC
LIMIT 10;

-- Top en plagas
SELECT farmer_name, pest_reports, total_points
FROM farmer_rankings
ORDER BY pest_reports DESC
LIMIT 10;

-- Top en sostenibilidad
SELECT farmer_name, sustainable_practices, total_points
FROM farmer_rankings
ORDER BY sustainable_practices DESC
LIMIT 10;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Los UUIDs deben ser reales de la tabla auth.users
2. Las contribuciones deben estar verificadas (verified = true) para contar
3. Los triggers actualizarán automáticamente farmer_rankings
4. Usa la función insert_sample_contributions() para generar datos rápido
5. Siempre prueba primero en un entorno de desarrollo
6. Los badges se calculan automáticamente según logros
7. El rank_position se calcula dinámicamente en las queries
*/

-- =====================================================
-- PARA PRODUCCIÓN
-- =====================================================

/*
En producción, los datos se generarán naturalmente a través de:
1. Agricultores registrándose en /auth/register
2. Agricultores creando contribuciones desde su dashboard
3. Administradores verificando contribuciones
4. Sistema actualizando rankings automáticamente

NO uses este script en producción con datos reales.
Solo úsalo para demostración y testing.
*/
