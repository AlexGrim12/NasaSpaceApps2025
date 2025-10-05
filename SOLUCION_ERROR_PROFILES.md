# 🚨 Solución Rápida: Error de Tabla "profiles"

## El Problema

```
ERROR: 42P07: relation "profiles" already exists
```

## ✅ Solución Inmediata

### Paso 1: Usar el Script Seguro

En lugar de ejecutar `satellite-images-schema.sql`, usa:

```sql
-- En Supabase Dashboard > SQL Editor
-- Ejecuta ESTE archivo:
database/satellite-images-schema-safe.sql
```

### Paso 2: Verificar que Funciona

Después de ejecutar el script seguro, ejecuta:

```sql
-- Verificación rápida:
database/diagnostico-db.sql
```

Deberías ver:

```
✅ satellite_images - EXISTE
✅ prediction_analysis - EXISTE
✅ bucket: satellite-images - EXISTE
```

## 🔍 ¿Por qué Pasa Esto?

El error ocurre cuando:

1. Ya tienes una tabla `profiles` en tu base de datos
2. Algún script anterior intentó crearla
3. Hay un conflicto de nombres

## 💡 Scripts Disponibles

### Para Usar AHORA (Seguro):

- `satellite-images-schema-safe.sql` ✅
- `diagnostico-db.sql` ✅

### No Uses (Puede Dar Error):

- `satellite-images-schema.sql` ❌ (si tienes conflictos)

## 🎯 Una Vez Resuelto

1. ✅ Ve a `/dashboard/farmer/bloom-prediction`
2. ✅ Selecciona una ubicación
3. ✅ Ejecuta análisis completo
4. ✅ Las predicciones se guardarán automáticamente
5. ✅ Usa "Guardar Imágenes en Bucket"

---

**¡Tu problema está resuelto!** Solo usa el script seguro 🚀
