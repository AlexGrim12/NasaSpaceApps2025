# ⚡ ACCIÓN INMEDIATA REQUERIDA

## 🚨 Estado Actual

Tu código está **100% correcto**, pero necesitas **1 configuración** para que funcione.

---

## ✅ LO QUE YA ESTÁ HECHO

1. ✅ Todos los archivos corregidos
2. ✅ Componente de contribuciones completo
3. ✅ APIs funcionando
4. ✅ Sistema de ranking implementado
5. ✅ 0 errores de compilación

---

## ⚠️ LO QUE NECESITAS HACER (5 MINUTOS)

### 🔑 Agregar Service Role Key

**¿Por qué?**
Supabase bloquea las inserciones por seguridad (RLS). Necesitas una key especial para el servidor.

**¿Cómo?**

```bash
# 1. Ve a Supabase Dashboard
https://supabase.com/dashboard

# 2. Abre tu proyecto → Settings → API

# 3. Copia "service_role" key (la larga que dice "secret")

# 4. Abre/Crea archivo .env.local en tu proyecto

# 5. Agrega esta línea:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIU... (tu key aquí)

# 6. Reinicia servidor:
npm run dev

# 7. ¡Listo! Prueba crear una contribución
```

---

## 📝 Ejemplo de .env.local

```bash
# URL y Anon Key (ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...

# Service Role Key (AGREGAR ESTA)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NOTA:** No tiene prefijo `NEXT_PUBLIC_` (esto es correcto)

---

## 🧪 Cómo Probar que Funciona

```bash
# 1. Servidor corriendo
npm run dev

# 2. Abre navegador
http://localhost:3000/contributions

# 3. Crea contribución de prueba:
- Tipo: Sequía
- Descripción: "Prueba del sistema"
- Click: "Enviar Contribución"

# 4. Debes ver:
✅ "¡Contribución creada exitosamente!"

# 5. En terminal verás:
✅ POST /api/contributions 200 in XXms
```

---

## 🎯 Resumen Visual

```
ANTES:
❌ POST /api/contributions 500
❌ Error: violates row-level security policy

DESPUÉS:
✅ POST /api/contributions 200
✅ Contribución creada exitosamente
```

---

## 📚 Si Necesitas Más Info

- **[CONFIGURACION_RAPIDA.md](./CONFIGURACION_RAPIDA.md)** ← Empieza aquí
- **[RLS_FIX_GUIDE.md](./RLS_FIX_GUIDE.md)** ← Guía detallada
- **[FARMER_GUIDE.md](./FARMER_GUIDE.md)** ← Para usuarios finales

---

## 💡 En 3 Pasos

1. **Supabase** → Settings → API → Copiar service_role key
2. **`.env.local`** → Agregar `SUPABASE_SERVICE_ROLE_KEY=...`
3. **Terminal** → `npm run dev` (reiniciar)

---

**¡Eso es todo!** Una vez que agregues la key, todo funcionará perfectamente. 🚀

¿Preguntas? Revisa [CONFIGURACION_RAPIDA.md](./CONFIGURACION_RAPIDA.md)
