-- ============================================
-- DIAGNÓSTICO DE BASE DE DATOS
-- ============================================
-- Este script ayuda a identificar problemas y conflictos
-- ============================================

-- 1. MOSTRAR TODAS LAS TABLAS EXISTENTES
-- ============================================
SELECT 'TABLAS EXISTENTES:' as info;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth') 
ORDER BY schemaname, tablename;

-- 2. VERIFICAR TABLAS ESPECÍFICAS DEL PROYECTO
-- ============================================
SELECT 'VERIFICACIÓN DE TABLAS DEL PROYECTO:' as info;

-- Verificar farm_locations
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_locations')
        THEN '✅ farm_locations - EXISTE'
        ELSE '❌ farm_locations - NO EXISTE'
    END as estado;

-- Verificar bloom_predictions
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bloom_predictions')
        THEN '✅ bloom_predictions - EXISTE'
        ELSE '❌ bloom_predictions - NO EXISTE'
    END as estado;

-- Verificar satellite_images
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'satellite_images')
        THEN '✅ satellite_images - EXISTE'
        ELSE '❌ satellite_images - NO EXISTE'
    END as estado;

-- Verificar prediction_analysis
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prediction_analysis')
        THEN '✅ prediction_analysis - EXISTE'
        ELSE '❌ prediction_analysis - NO EXISTE'
    END as estado;

-- Verificar profiles (causa del error)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
        THEN '⚠️ profiles - EXISTE (puede causar conflictos)'
        ELSE '✅ profiles - NO EXISTE'
    END as estado;

-- 3. VERIFICAR BUCKETS DE STORAGE
-- ============================================
SELECT 'BUCKETS DE STORAGE:' as info;
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY created_at;

-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 'POLÍTICAS RLS ACTIVAS:' as info;
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VERIFICAR POLÍTICAS DE STORAGE
-- ============================================
SELECT 'POLÍTICAS DE STORAGE:' as info;
SELECT 
    policyname,
    bucket_id,
    target,
    check_expression,
    definition
FROM storage.policies
ORDER BY bucket_id, policyname;

-- 6. VERIFICAR ESTRUCTURA DE TABLAS ESPECÍFICAS
-- ============================================
SELECT 'ESTRUCTURA DE bloom_predictions:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'bloom_predictions'
ORDER BY ordinal_position;

-- 7. BUSCAR REFERENCIAS A 'profiles'
-- ============================================
SELECT 'BÚSQUEDA DE REFERENCIAS A profiles:' as info;

-- Buscar en constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND (tc.table_name ILIKE '%profile%' OR ccu.table_name ILIKE '%profile%');

-- 8. RESUMEN Y RECOMENDACIONES
-- ============================================
SELECT 'RESUMEN:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
        THEN 'PROBLEMA IDENTIFICADO: La tabla profiles ya existe. Usa satellite-images-schema-safe.sql'
        ELSE 'OK: No hay conflicto con tabla profiles'
    END as diagnostico;