# 🌸 Predicción de Floración - Guía Rápida

## Setup en 5 Minutos

### 1. Ejecutar SQL en Supabase

```sql
-- Copiar y ejecutar: database/farm-locations-schema.sql
```

### 2. Agregar Variable de Entorno

```env
# .env.local
NEXT_PUBLIC_BLOOM_API_URL=http://localhost:8000
```

### 3. Iniciar Backend Python (FastAPI)

```bash
# El backend con el modelo LSTM debe estar corriendo
python main.py
```

### 4. Acceder

```
http://localhost:3000/dashboard/farmer/bloom-prediction
```

## 📁 Archivos Creados

### Base de Datos

- `/database/farm-locations-schema.sql` - Schema completo con RLS

### Backend (API)

- `/src/app/api/farm-locations/route.ts` - GET, POST ubicaciones
- `/src/app/api/farm-locations/[id]/route.ts` - DELETE ubicación
- `/src/app/api/bloom-predictions/route.ts` - GET, POST predicciones

### Frontend

- `/src/app/dashboard/farmer/bloom-prediction/page.tsx` - Página principal
- `/src/app/dashboard/farmer/page.tsx` - Actualizado con enlace

### Documentación

- `/BLOOM_PREDICTION_SETUP.md` - Guía completa
- `/BLOOM_PREDICTION_QUICKSTART.md` - Esta guía

## 🎯 Funcionalidades

✅ **Gestión de Parcelas**

- Guardar coordenadas GPS de tus terrenos
- Ver lista de todas tus ubicaciones
- Eliminar ubicaciones

✅ **Predicciones con IA**

- Modelo LSTM entrenado con datos NASA
- Fecha predicha de floración
- GDC acumulado, NDVI, temperatura
- Guardar predicciones en BD

✅ **Timeline Completo**

- Probabilidades día por día
- Top 10 fechas más probables
- Visualización por colores

## 🧪 Probar Rápidamente

```typescript
// 1. Login como agricultor
// 2. Ir a Dashboard > Predicción de Floración
// 3. Agregar parcela con estas coordenadas:

Jalisco, México
Lat: 20.6736
Lon: -103.3444

// 4. Click "Analizar"
// 5. Click "Ejecutar Predicción"
```

## 📊 Endpoints del Backend Python

El frontend se conecta a estos endpoints:

```python
POST /predecir
{
  "latitud": 20.6736,
  "longitud": -103.3444,
  "fecha_actual": "2025-07-15",
  "año_actual": 2025,
  "dias_historia": 30,
  "dia_inicio_cultivo": "05-15"
}

POST /timeline-floracion
{
  "latitud": 20.6736,
  "longitud": -103.3444,
  "año": 2025,
  "dia_inicio_cultivo": "05-15"
}
```

## 🐛 Problemas Comunes

### "Error de conexión"

➡️ Backend Python no está corriendo

```bash
curl http://localhost:8000/salud
```

### "No autorizado"

➡️ Token expirado, hacer logout/login

### No aparecen ubicaciones

➡️ Verificar RLS policies en Supabase

## 📚 Variables Analizadas

| Variable      | Descripción                               |
| ------------- | ----------------------------------------- |
| GDC           | Growing Degree Days (acumulación térmica) |
| NDVI          | Índice de vegetación (Sentinel-2)         |
| Precipitación | Lluvia diaria/acumulada (NASA POWER)      |
| Temperatura   | Media, máx, mín (NASA POWER)              |

## 🎨 UI Features

- ✅ Responsive (mobile, tablet, desktop)
- ✅ Dark mode
- ✅ Coordenadas predefinidas
- ✅ Validaciones de formulario
- ✅ Loading states
- ✅ Alertas de éxito/error

## 🔒 Seguridad

- Row Level Security (RLS) habilitado
- JWT authentication en todos los endpoints
- Agricultores solo ven sus propias ubicaciones
- Investigadores pueden ver datos agregados

## 📈 Próximos Pasos

Después de setup básico:

1. Ver documentación completa: `BLOOM_PREDICTION_SETUP.md`
2. Explorar el schema SQL
3. Probar con diferentes coordenadas
4. Guardar y comparar predicciones

---

**¿Necesitas ayuda?**
Ver documentación completa en `/BLOOM_PREDICTION_SETUP.md`

**Estado**: ✅ Listo para producción
