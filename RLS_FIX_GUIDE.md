# 🔧 Solución Completa para Error RLS (Row Level Security)

## 🚨 Problema

```
Error creating contribution: {
  code: '42501',
  message: 'new row violates row-level security policy for table "contributions"'
}
POST /api/contributions 500 in 642ms
```

## ✅ Solución Implementada

### Opción 1: Usar Service Role Key (Recomendado) ⭐

Esta es la solución más simple y segura. Usa un cliente admin que bypassa RLS solo en las API routes del servidor.

#### Paso 1: Obtener Service Role Key

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Settings** → **API**
3. Copia el **service_role key** (secret key)
4. ⚠️ **NUNCA expongas esta key en el cliente**

#### Paso 2: Agregar a Variables de Entorno

Edita tu archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui  # ← NUEVA
```

⚠️ **IMPORTANTE:**

- El `service_role_key` **NO** tiene el prefijo `NEXT_PUBLIC_`
- Esto asegura que solo esté disponible en el servidor
- Nunca se expone al navegador

#### Paso 3: Reiniciar Servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

### Archivos Ya Modificados ✅

Ya he actualizado estos archivos por ti:

1. ✅ **`/src/lib/supabase-admin.ts`** (NUEVO)

   - Cliente admin con service_role_key
   - Solo para uso en servidor

2. ✅ **`/src/app/api/contributions/route.ts`**

   - Usa `supabaseAdmin` para INSERT
   - Bypassa RLS de forma segura

3. ✅ **`.env.example`**
   - Template actualizado con nueva variable

---

## 🔄 Opción 2: Configurar Políticas RLS (Alternativa)

Si prefieres mantener RLS activo, ejecuta este script SQL en Supabase.

### Script: `/database/fix-rls-policies.sql`

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden crear sus propias contribuciones" ON contributions;
DROP POLICY IF EXISTS "public_contributions_select" ON contributions;

-- Crear política para INSERT
CREATE POLICY "insert_own_contributions"
ON contributions
FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

-- Crear política para SELECT
CREATE POLICY "select_verified_contributions"
ON contributions
FOR SELECT
USING (verified = true OR auth.uid() = farmer_id);

-- Habilitar RLS
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist de Configuración

### Setup Inicial (5 minutos)

- [ ] **1. Obtener Service Role Key**

  ```
  Supabase Dashboard → Settings → API → service_role key (copiar)
  ```

- [ ] **2. Agregar a .env.local**

  ```bash
  SUPABASE_SERVICE_ROLE_KEY=eyJhbG...tu-key-completa
  ```

- [ ] **3. Verificar que existe el archivo**

  ```bash
  ls -la .env.local
  # Debe mostrar el archivo
  ```

- [ ] **4. Reiniciar servidor**

  ```bash
  npm run dev
  ```

- [ ] **5. Verificar que carga la variable**
  ```typescript
  // Puedes agregar esto temporalmente en tu API route para debug:
  console.log('Service key loaded:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  // Debe mostrar: Service key loaded: true
  ```

### Testing (3 minutos)

- [ ] **1. Login como agricultor**

  ```
  http://localhost:3000/auth/login
  ```

- [ ] **2. Ir a contribuciones**

  ```
  http://localhost:3000/contributions
  ```

- [ ] **3. Crear contribución de prueba**

  ```
  - Seleccionar tipo: Sequía
  - Descripción: "Prueba de sistema de contribuciones"
  - Click "Enviar Contribución"
  ```

- [ ] **4. Verificar éxito**

  ```
  Deberías ver: ✅ "¡Contribución creada exitosamente!"
  ```

- [ ] **5. Verificar en terminal**

  ```
  Terminal debe mostrar:
  ✅ POST /api/contributions 200 in XXms

  NO debe mostrar:
  ❌ Error creating contribution
  ❌ violates row-level security policy
  ```

- [ ] **6. Verificar en Supabase**

  ```sql
  -- En Supabase SQL Editor:
  SELECT * FROM contributions ORDER BY created_at DESC LIMIT 5;

  -- Deberías ver tu contribución
  ```

---

## 🔍 Troubleshooting

### Error: "Service role key not found"

**Síntoma:**

```
Error: process.env.SUPABASE_SERVICE_ROLE_KEY is undefined
```

**Solución:**

```bash
# 1. Verifica que el archivo .env.local existe
cat .env.local

# 2. Verifica que la variable está sin NEXT_PUBLIC_
# ✅ Correcto:
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# ❌ Incorrecto:
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 3. Reinicia el servidor
npm run dev
```

### Error persiste: "violates row-level security policy"

**Causa:** El service_role_key no se cargó correctamente.

**Solución:**

```bash
# 1. Verifica las variables de entorno
echo $SUPABASE_SERVICE_ROLE_KEY
# Debe mostrar la key

# 2. Si está vacío, exporta manualmente:
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# 3. Reinicia el servidor
npm run dev
```

### Error: "Invalid JWT"

**Causa:** El token del cliente expiró.

**Solución:**

```bash
# 1. Cierra sesión
# 2. Inicia sesión nuevamente
# 3. Intenta crear contribución de nuevo
```

---

## 📊 Comparación de Enfoques

| Aspecto           | Service Role Key        | Políticas RLS      |
| ----------------- | ----------------------- | ------------------ |
| **Seguridad**     | ✅ Alta (solo servidor) | ✅ Alta (nivel DB) |
| **Complejidad**   | 🟢 Baja                 | 🟡 Media           |
| **Setup**         | 🟢 5 minutos            | 🟡 15 minutos      |
| **Mantenimiento** | 🟢 Bajo                 | 🟡 Medio           |
| **Recomendado**   | ✅ Sí                   | Solo si necesario  |

---

## 🎯 Qué Hace el Service Role Key

### Cliente Normal (anon key):

```typescript
// ❌ Respeta RLS - puede fallar
const { data, error } = await supabase
  .from('contributions')
  .insert({ ... })
// Error: violates row-level security policy
```

### Cliente Admin (service_role key):

```typescript
// ✅ Bypassa RLS - siempre funciona
const { data, error } = await supabaseAdmin
  .from('contributions')
  .insert({ ... })
// Success: row inserted
```

### Por qué es Seguro:

1. **Solo servidor:** La key nunca llega al navegador
2. **No exponible:** Sin prefijo `NEXT_PUBLIC_`
3. **Autenticación previa:** Verificamos JWT antes de usar admin
4. **Validaciones:** Código valida permisos antes de insertar

```typescript
// FLUJO SEGURO:
// 1. Cliente envía JWT
// 2. Servidor valida JWT con supabase.auth.getUser(token)
// 3. Si válido, extrae user.id
// 4. Usa supabaseAdmin para insertar con farmer_id = user.id
// 5. Usuario solo puede crear SUS contribuciones
```

---

## 📝 Resumen

### Lo que se corrigió:

1. ✅ **Creado** `/src/lib/supabase-admin.ts`
   - Cliente admin para API routes
2. ✅ **Modificado** `/src/app/api/contributions/route.ts`
   - Usa `supabaseAdmin` en vez de `supabase` para INSERT
3. ✅ **Actualizado** `.env.example`
   - Agregada variable `SUPABASE_SERVICE_ROLE_KEY`
4. ✅ **Creado** `/database/fix-rls-policies.sql`
   - Alternativa con políticas RLS

### Lo que debes hacer:

1. ⚠️ **Agregar service_role_key a `.env.local`**
2. ⚠️ **Reiniciar servidor**
3. ✅ **Probar crear contribución**

---

## 🎉 Resultado Esperado

### Antes (con error):

```
❌ POST /api/contributions 500 in 642ms
Error: new row violates row-level security policy
```

### Después (funcionando):

```
✅ POST /api/contributions 200 in 145ms
{
  "success": true,
  "data": {
    "id": "...",
    "farmer_id": "...",
    "type": "drought_report",
    "points_earned": 50,
    "verified": false,
    ...
  },
  "message": "Contribución creada exitosamente."
}
```

---

## 📞 Ayuda Adicional

### Documentos relacionados:

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Service Role Key Usage](https://supabase.com/docs/guides/api/api-keys)
- [NEXTJS15_FIXES.md](../NEXTJS15_FIXES.md)

### ¿Necesitas más ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Verifica los logs del servidor
2. Revisa que todas las variables estén en `.env.local`
3. Confirma que reiniciaste el servidor
4. Verifica en Supabase que las tablas existen

---

_Solución implementada el 4 de octubre de 2025_
_Next.js 15.5.4 + Supabase_
