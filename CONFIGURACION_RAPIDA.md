# 🎯 ACCIÓN REQUERIDA: Configurar Service Role Key

## ⚡ Resumen Rápido

Hay 2 errores que ya fueron corregidos en el código:
1. ✅ Error de `params.id` en Next.js 15 - **CORREGIDO**
2. ⚠️ Error de RLS al crear contribuciones - **NECESITAS CONFIGURAR**

## 🔧 Lo Que Debes Hacer AHORA (5 minutos)

### Paso 1: Obtener tu Service Role Key

1. Ve a: https://supabase.com/dashboard
2. Abre tu proyecto BloomWatch
3. Click en **Settings** (⚙️ izquierda abajo)
4. Click en **API**
5. Busca la sección **Project API keys**
6. Copia el **`service_role`** key (es el secreto, tiene "secret" en el label)

### Paso 2: Agregar a tu .env.local

Abre tu archivo `.env.local` (o créalo si no existe):

```bash
# Tus variables existentes
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ AGREGAR ESTA NUEVA LÍNEA:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu-service-role-key-aqui
```

⚠️ **IMPORTANTE:** 
- Esta key **NO** tiene el prefijo `NEXT_PUBLIC_`
- Es solo para el servidor, nunca se expone al cliente
- Es sensible - no la subas a Git

### Paso 3: Reiniciar el Servidor

```bash
# En tu terminal, presiona Ctrl+C para detener
# Luego reinicia:
npm run dev
```

### Paso 4: Probar

1. Ve a: http://localhost:3000/contributions
2. Crea una contribución de prueba
3. Deberías ver: ✅ "¡Contribución creada exitosamente!"

## 📊 Qué Pasará

### ANTES (sin service_role_key):
```
❌ POST /api/contributions 500 in 642ms
Error: new row violates row-level security policy
```

### DESPUÉS (con service_role_key):
```
✅ POST /api/contributions 200 in 145ms
Contribución creada exitosamente
```

## 🎯 Archivos Ya Modificados Por Mí

1. ✅ `/src/lib/supabase-admin.ts` - Cliente admin creado
2. ✅ `/src/app/api/contributions/route.ts` - Usa cliente admin
3. ✅ `/src/app/api/rankings/[id]/route.ts` - Params corregidos
4. ✅ `/src/components/ContributionForm.tsx` - Envía token
5. ✅ `.env.example` - Template actualizado

## ❓ FAQ Rápido

### ¿Por qué necesito la service_role_key?

Las políticas de Row Level Security (RLS) en Supabase bloquean las inserciones desde el cliente anon. La service_role_key permite al servidor hacer operaciones de forma segura.

### ¿Es seguro?

Sí, porque:
- Solo existe en el servidor (sin NEXT_PUBLIC_)
- El código valida el JWT del usuario primero
- El usuario solo puede crear SUS propias contribuciones

### ¿Dónde encuentro la key?

Supabase Dashboard → Tu Proyecto → Settings → API → service_role key

### ¿Puedo usar otra solución?

Sí, puedes configurar políticas RLS. Mira el archivo: `/database/fix-rls-policies.sql`

## 🚨 Si Algo Sale Mal

### Error: "Service role key not found"

```bash
# Verifica que esté en .env.local (sin NEXT_PUBLIC_):
cat .env.local | grep SERVICE_ROLE

# Debe mostrar:
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Aún aparece el error RLS

```bash
# 1. Verifica que guardaste .env.local
# 2. Reinicia el servidor (Ctrl+C, luego npm run dev)
# 3. Cierra sesión y vuelve a entrar
# 4. Intenta de nuevo
```

## 📚 Documentación Completa

Para más detalles, revisa:
- **[RLS_FIX_GUIDE.md](./RLS_FIX_GUIDE.md)** - Guía completa y detallada
- **[NEXTJS15_FIXES.md](./NEXTJS15_FIXES.md)** - Correcciones de Next.js 15
- **[FARMER_GUIDE.md](./FARMER_GUIDE.md)** - Guía del usuario

## ✅ Checklist Final

- [ ] Obtuve la service_role_key de Supabase
- [ ] La agregué a .env.local (sin NEXT_PUBLIC_)
- [ ] Reinicié el servidor (npm run dev)
- [ ] Probé crear una contribución
- [ ] Funcionó correctamente ✨

---

**¿Todo listo?** Una vez que agregues la key y reinicies, ¡el sistema estará 100% funcional! 🚀

*Última actualización: 4 de octubre de 2025*
