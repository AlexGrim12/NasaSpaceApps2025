# 🗄️ Setup de Base de Datos para Predicciones

## ⚠️ Solución de Errores Comunes

### Error: "relation 'profiles' already exists"

Si recibes este error, usa el script seguro:

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar ESTE archivo en lugar del original:
database/satellite-images-schema-safe.sql
```

### 🔍 Diagnóstico de Problemas

Para identificar conflictos en tu base de datos:

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar para diagnóstico:
database/diagnostico-db.sql
```

## 📋 Instrucciones de Setup

### 1. **Configurar Base de Datos Principal**

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar primero (si no existe):
database/farm-locations-schema.sql
```

### 2. **Configurar Tablas de Predicciones (OPCIÓN SEGURA)**

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar segundo (RECOMENDADO):
database/satellite-images-schema-safe.sql
```

### 2b. **Configurar Tablas de Predicciones (OPCIÓN ORIGINAL)**

```bash
# Solo si no tienes conflictos:
database/satellite-images-schema.sql
```

## Pasos para Configurar

### 1. Abrir Supabase Dashboard

- Ve a [supabase.com](https://supabase.com)
- Accede a tu proyecto BloomWatch

### 2. Ejecutar SQL Schema

- En el panel izquierdo, haz clic en "SQL Editor"
- Haz clic en "New query"
- Copia y pega el contenido de `database/satellite-images-schema.sql`
- Ejecuta la consulta (Ctrl/Cmd + Enter)

### 3. Verificar Creación de Tablas

Ve a "Table Editor" y verifica que se crearon:

- ✅ `bloom_predictions` (ya existía)
- ✅ `satellite_images` (nueva)
- ✅ `prediction_analysis` (nueva)

### 4. Verificar Setup Exitoso

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar para verificar:
database/diagnostico-db.sql

# Deberías ver:
# ✅ satellite_images - EXISTE
# ✅ prediction_analysis - EXISTE
# ✅ bucket: satellite-images - EXISTE
```

### 5. Verificar Storage Bucket

Ve a "Storage" y verifica que se creó:

- ✅ `satellite-images` bucket

## 🔧 Archivos de Setup Disponibles

- **`satellite-images-schema-safe.sql`** - RECOMENDADO (maneja conflictos)
- `satellite-images-schema.sql` - Original (puede dar errores si hay conflictos)
- `diagnostico-db.sql` - Herramienta de diagnóstico y verificación

## Características Implementadas

### ✅ Guardado Completo de Predicciones

- Datos principales de predicción en `bloom_predictions`
- Métricas y gráficas en `prediction_analysis`
- Imágenes satelitales en `satellite_images`

### ✅ Storage de Imágenes

- Bucket `satellite-images` para archivos
- URLs seguras con políticas RLS
- Organización por usuario y predicción

### ✅ Seguridad (Row Level Security)

- Cada usuario solo ve sus propios datos
- Políticas de acceso configuradas
- Separación de datos por farmer_id

## Funciones Disponibles

### En el Frontend (`/lib/bloom-predictions.ts`):

- `savePredictionWithAnalysis()` - Guarda predicción completa
- `uploadSatelliteImage()` - Sube imagen al bucket
- `getUserPredictions()` - Obtiene predicciones del usuario
- `deletePrediction()` - Elimina predicción y archivos

### En la UI (`bloom-prediction/page.tsx`):

- ✅ Guardado automático de predicciones
- ✅ Botón "Guardar Imágenes en Bucket"
- ✅ Visualización de progreso
- ✅ Manejo de errores

## Estructura de Datos

### Predicción Principal

```typescript
interface BloomPredictionData {
  location_id: string
  analysis_date: string
  predicted_bloom_date: string
  days_to_bloom: number
  gdc_accumulated: number
  ndvi_value?: number
  temperature_avg?: number
  precipitation_total?: number
  model_version?: string
  metadata?: Record<string, any>
}
```

### Análisis de Gráficas

```typescript
interface AnalysisData {
  analysis_type:
    | 'training'
    | 'timeline'
    | 'phenology'
    | 'precipitation'
    | 'temperature'
  chart_data: Record<string, any>
  metrics?: Record<string, any>
}
```

### Imágenes Satelitales

```typescript
interface SatelliteImageData {
  image_url: string
  image_path?: string
  description: string
  requested_date: string
  image_date: string
  cloud_cover: number
  image_type?: string
  metadata?: Record<string, any>
}
```

## Próximos Pasos

1. **Ejecutar el SQL**: Aplica `database/satellite-images-schema.sql`
2. **Probar la funcionalidad**: Ejecuta una predicción completa
3. **Verificar almacenamiento**: Revisa que las imágenes se guarden en Storage
4. **Historial de predicciones**: Las predicciones se guardan para consulta posterior

## Troubleshooting

### Error: "relation does not exist"

- Verifica que ejecutaste `satellite-images-schema.sql`
- Revisa que las tablas estén creadas en Table Editor

### Error: "bucket does not exist"

- Ve a Storage y verifica el bucket `satellite-images`
- Ejecuta nuevamente la sección de storage del SQL

### Error: "RLS policy"

- Verifica que las políticas RLS estén activas
- Usuario debe estar autenticado correctamente

## Testing

Para probar la funcionalidad:

1. Inicia sesión como agricultor
2. Ve a "Predicción de Floración"
3. Selecciona una ubicación
4. Ejecuta "Análisis Completo"
5. Verifica que se guarde automáticamente
6. Usa botón "Guardar Imágenes en Bucket"
7. Revisa Storage en Supabase Dashboard
