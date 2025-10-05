# 🌸 Sistema de Predicción de Floración - BloomWatch

## Descripción General

Hemos integrado un sistema completo de predicción de floración de maíz usando Machine Learning (LSTM) y datos satelitales de la NASA. Esta funcionalidad permite a los agricultores:

- 📍 Guardar las coordenadas GPS de sus parcelas
- 🔮 Obtener predicciones de fechas de floración
- 📊 Ver timeline completo con probabilidades diarias
- 💾 Guardar historial de predicciones

## 🏗️ Arquitectura

### Base de Datos

Se crearon dos nuevas tablas en Supabase:

1. **`farm_locations`** - Ubicaciones de parcelas de agricultores
2. **`bloom_predictions`** - Historial de predicciones guardadas

### API Endpoints

#### Farm Locations

- `GET /api/farm-locations` - Obtener ubicaciones del usuario
- `POST /api/farm-locations` - Crear nueva ubicación
- `DELETE /api/farm-locations/[id]` - Eliminar ubicación

#### Bloom Predictions

- `GET /api/bloom-predictions` - Obtener predicciones históricas
- `POST /api/bloom-predictions` - Guardar nueva predicción

### Frontend

- **Página Principal**: `/dashboard/farmer/bloom-prediction`
- **Integración**: Enlace agregado en el dashboard del agricultor

## 📝 Instrucciones de Instalación

### 1. Base de Datos

Ejecutar el script SQL en Supabase:

```bash
# Ubicación del archivo
/database/farm-locations-schema.sql
```

**Pasos:**

1. Ir a Supabase Dashboard
2. Seleccionar tu proyecto
3. Ir a SQL Editor
4. Abrir el archivo `farm-locations-schema.sql`
5. Ejecutar todo el script (RUN)

El script creará:

- ✅ Tablas `farm_locations` y `bloom_predictions`
- ✅ Índices para rendimiento
- ✅ Row Level Security (RLS) policies
- ✅ Funciones útiles (distancia, triggers)
- ✅ Vista de estadísticas

### 2. Variables de Entorno

Agregar a tu archivo `.env.local`:

```env
# API de predicción de floración (backend Python con FastAPI)
NEXT_PUBLIC_BLOOM_API_URL=http://localhost:8000

# Las demás variables de Supabase ya deberían estar configuradas
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Backend de Predicción (Python/FastAPI)

El sistema se conecta a un backend Python con FastAPI que ejecuta el modelo LSTM. Este backend debe estar corriendo en `http://localhost:8000` (o la URL configurada).

**Endpoints requeridos del backend:**

- `POST /predecir` - Realizar predicción de floración
- `POST /timeline-floracion` - Generar timeline completo
- `POST /entrenar` - Entrenar nuevo modelo (opcional)
- `GET /salud` - Health check

**Ejemplo de payload para `/predecir`:**

```json
{
  "latitud": 20.6736,
  "longitud": -103.3444,
  "fecha_actual": "2025-07-15",
  "año_actual": 2025,
  "dias_historia": 30,
  "dia_inicio_cultivo": "05-15"
}
```

**Respuesta esperada:**

```json
{
  "fecha_actual": "2025-07-15",
  "fecha_floracion_predicha": "2025-08-20",
  "dias_hasta_floracion": 36,
  "gdc_acumulado": 850.5,
  "ndvi_actual": 0.725,
  "confianza": 0.87
}
```

### 4. Instalar y Correr

```bash
# Instalar dependencias (si agregaste nuevas)
npm install

# Correr en desarrollo
npm run dev

# Acceder a
http://localhost:3000/dashboard/farmer/bloom-prediction
```

## 🎯 Características Implementadas

### ✅ Gestión de Ubicaciones

- Crear, ver y eliminar ubicaciones de parcelas
- Guardar coordenadas GPS (latitud/longitud)
- Información adicional: hectáreas, variedad de cultivo, fecha de siembra
- Coordenadas predefinidas (México, Argentina, etc.)

### ✅ Predicción de Floración

- Conexión con API de ML (LSTM)
- Parámetros configurables (fecha actual, año, días de historia)
- Resultados detallados:
  - Fecha predicha de floración
  - Días restantes hasta floración
  - GDC acumulado (Growing Degree Days)
  - NDVI actual (si disponible)

### ✅ Timeline de Probabilidades

- Vista completa de la temporada
- Probabilidades día por día
- Top 10 fechas más probables
- Visualización con colores por nivel de probabilidad

### ✅ Persistencia de Datos

- Guardar predicciones en base de datos
- Historial de predicciones por parcela
- RLS para seguridad de datos por usuario

### ✅ UI/UX

- Diseño responsive (mobile, tablet, desktop)
- Dark mode compatible
- Alertas y notificaciones
- Loading states
- Validaciones de formulario

## 📊 Tablas de Base de Datos

### farm_locations

| Campo         | Tipo          | Descripción             |
| ------------- | ------------- | ----------------------- |
| id            | UUID          | Primary key             |
| farmer_id     | UUID          | FK a auth.users         |
| name          | VARCHAR(255)  | Nombre de la parcela    |
| description   | TEXT          | Descripción opcional    |
| latitude      | DECIMAL(10,8) | Latitud (-90 a 90)      |
| longitude     | DECIMAL(11,8) | Longitud (-180 a 180)   |
| hectares      | DECIMAL(10,2) | Superficie en hectáreas |
| crop_variety  | VARCHAR(100)  | Variedad de cultivo     |
| planting_date | DATE          | Fecha de siembra        |
| created_at    | TIMESTAMP     | Fecha de creación       |
| updated_at    | TIMESTAMP     | Última actualización    |

### bloom_predictions

| Campo                | Tipo          | Descripción              |
| -------------------- | ------------- | ------------------------ |
| id                   | UUID          | Primary key              |
| location_id          | UUID          | FK a farm_locations      |
| farmer_id            | UUID          | FK a auth.users          |
| prediction_date      | TIMESTAMP     | Momento de la predicción |
| analysis_date        | DATE          | Fecha de análisis usada  |
| predicted_bloom_date | DATE          | Fecha predicha           |
| days_to_bloom        | INTEGER       | Días hasta floración     |
| gdc_accumulated      | DECIMAL(10,2) | GDC acumulado            |
| ndvi_value           | DECIMAL(5,3)  | Valor NDVI               |
| confidence_score     | DECIMAL(5,2)  | Confianza (0-100)        |
| temperature_avg      | DECIMAL(5,2)  | Temperatura promedio     |
| precipitation_total  | DECIMAL(10,2) | Precipitación total      |
| model_version        | VARCHAR(50)   | Versión del modelo       |
| metadata             | JSONB         | Datos adicionales        |

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

**farm_locations:**

- ✅ Agricultores pueden ver solo sus propias ubicaciones
- ✅ Agricultores pueden crear/editar/eliminar solo sus ubicaciones
- ✅ Investigadores pueden ver todas las ubicaciones (agregadas)

**bloom_predictions:**

- ✅ Agricultores pueden ver solo sus propias predicciones
- ✅ Agricultores pueden crear predicciones
- ✅ Investigadores pueden ver todas las predicciones

### Autenticación API

Todos los endpoints requieren un token JWT válido:

```typescript
Authorization: Bearer<token>
```

## 🧪 Testing

### Probar la Funcionalidad

1. **Login como Agricultor**

   ```
   http://localhost:3000/auth/login
   ```

2. **Ir al Dashboard**

   ```
   http://localhost:3000/dashboard/farmer
   ```

3. **Click en "Predicción de Floración"**

   - Botón verde con icono de hoja 🌿

4. **Agregar una Parcela**

   - Click en el botón "+"
   - Llenar formulario (nombre, coordenadas)
   - Puedes usar coordenadas predefinidas

5. **Seleccionar la Parcela**

   - Click en "Analizar"

6. **Ejecutar Predicción**

   - Ajustar parámetros si es necesario
   - Click en "Ejecutar Predicción"

7. **Ver Timeline** (opcional)
   - Cambiar a tab "Timeline"
   - Click en "Generar Timeline"

### Datos de Prueba

Coordenadas de ejemplo:

```
🇲🇽 Jalisco, México
Lat: 20.6736
Lon: -103.3444

🇲🇽 México Central
Lat: 19.20
Lon: -99.40

🇦🇷 Argentina
Lat: -38.0
Lon: -57.5
```

## 📈 Variables del Modelo

El sistema analiza las siguientes variables:

1. **GDC (Growing Degree Days)**

   - Acumulación térmica para desarrollo fenológico
   - Calculado usando temperatura base de 10°C

2. **NDVI (Normalized Difference Vegetation Index)**

   - Índice de vegetación de Sentinel-2
   - Indica vigor y desarrollo del cultivo
   - Rango: 0 a 1 (0.7+ = vegetación saludable)

3. **Precipitación**

   - Datos diarios y acumulados (mm)
   - Fuente: NASA POWER API

4. **Temperatura**
   - Media, máxima y mínima diarias (°C)
   - Fuente: NASA POWER API

## 🚀 Próximas Mejoras

- [ ] Visualización con gráficas (Chart.js)
- [ ] Mapas interactivos con Mapbox/Leaflet
- [ ] Exportar reportes en PDF
- [ ] Notificaciones push cuando se acerca floración
- [ ] Comparación de predicciones vs. realidad
- [ ] Recomendaciones de riego basadas en predicción
- [ ] Integración con cámaras/drones para validación

## 📝 Notas Importantes

1. **Backend de Predicción**: El sistema requiere que el backend Python esté corriendo. Sin esto, las predicciones no funcionarán.

2. **Coordenadas**: Las coordenadas deben estar en formato decimal (no grados-minutos-segundos).

3. **Temporada**: El modelo está entrenado para la temporada de maíz (Mayo-Septiembre en México).

4. **Performance**: La primera predicción puede tardar más (carga del modelo).

## 🐛 Troubleshooting

### Error: "Error de conexión con el servicio de predicción"

**Causa**: Backend Python no está corriendo

**Solución**:

```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/salud

# Si no responde, iniciar el backend Python
cd /path/to/bloom-api
python main.py
```

### Error: "No autorizado"

**Causa**: Token expirado o inválido

**Solución**:

1. Hacer logout
2. Login de nuevo
3. Intentar nuevamente

### Error: "Ubicación no encontrada"

**Causa**: RLS policies no están aplicadas

**Solución**:

1. Verificar que ejecutaste el script SQL completo
2. Revisar en Supabase que las policies estén activas
3. Re-ejecutar la sección de RLS del script

## 📚 Recursos Adicionales

- **Documentación Supabase**: https://supabase.com/docs
- **NASA POWER API**: https://power.larc.nasa.gov/
- **Google Earth Engine**: https://earthengine.google.com/
- **FastAPI**: https://fastapi.tiangolo.com/

## 🎉 Créditos

Sistema desarrollado para BloomWatch - NASA Space Apps Challenge 2025
Usando:

- Next.js 15
- TypeScript
- Supabase
- TensorFlow/Keras (LSTM)
- NASA POWER API
- Sentinel-2 Satellite Data

---

**Estado**: ✅ Completamente implementado y listo para usar
**Fecha**: Octubre 2025
**Versión**: 1.0.0
