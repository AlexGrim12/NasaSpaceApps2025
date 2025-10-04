# 🚀 Guía Rápida: Panel de Administrador

## 📝 Pasos para Activar el Panel de Admin

### 1️⃣ Ejecutar Script SQL (2 minutos)

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `database/admin-roles.sql`
4. Clic en **RUN**

✅ **Resultado:** Tablas `user_roles` y `contribution_verifications` creadas

---

### 2️⃣ Crear tu Primer Admin (30 segundos)

En **Supabase SQL Editor**, ejecuta:

```sql
-- Reemplaza con TU email (el que usas para login)
SELECT public.make_user_admin('tu-email@ejemplo.com');
```

✅ **Resultado:** `"Usuario tu-email@ejemplo.com es ahora administrador"`

---

### 3️⃣ Verificar que Funcionó (30 segundos)

```sql
-- Ver lista de admins
SELECT u.email, ur.granted_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

✅ **Deberías ver:** Tu email en la lista

---

### 4️⃣ Refrescar Sesión (1 minuto)

1. En BloomWatch, clic en **Salir**
2. Vuelve a **Iniciar Sesión**
3. Deberías ver un botón **🛡️ Admin** (naranja) en el navbar

---

### 5️⃣ Acceder al Panel (¡Listo!)

1. Clic en **🛡️ Admin** en el navbar
2. O ve directamente a: `http://localhost:3000/admin/contributions`

---

## 🎯 ¿Qué Puedes Hacer?

### ✅ Aprobar Contribuciones

- Ve contribuciones pendientes
- Clic en **Ver Detalles**
- Clic en **✅ Aprobar**
- Los puntos se otorgan automáticamente

### ❌ Rechazar Contribuciones

- Clic en **❌ Rechazar**
- La contribución permanece sin verificar
- No se otorgan puntos

### 🔄 Revocar Verificaciones

- Para contribuciones ya verificadas
- Clic en **🔄 Revocar Verificación**
- Los puntos se recalculan automáticamente

### 🔍 Buscar y Filtrar

- **Buscar:** Por nombre, email o descripción
- **Filtros:** Todas | Pendientes | Verificadas
- **Stats:** Ver totales en tiempo real

---

## 🐛 Problemas Comunes

### ❌ "No veo el botón Admin"

**Solución:**

1. Verifica que ejecutaste el SQL
2. Verifica que tienes rol admin:

```sql
SELECT public.is_admin(auth.uid());
```

3. Cierra sesión y vuelve a entrar

---

### ❌ "Error 403: Acceso Denegado"

**Solución:**

1. Ejecuta de nuevo:

```sql
SELECT public.make_user_admin('tu-email@ejemplo.com');
```

2. Cierra sesión
3. Inicia sesión nuevamente

---

### ❌ "No se cargan las contribuciones"

**Solución:**

1. Verifica que tienes contribuciones creadas
2. Como agricultor, ve a `/contributions` y crea una
3. Refresca el panel admin

---

## 📊 Flujo Completo de Prueba

### Como Agricultor:

1. Login como agricultor
2. Ve a **Contribuir** (navbar)
3. Crea una contribución:
   - Tipo: Reporte de Sequía
   - Descripción: "Prueba de sequía en zona norte"
4. Clic en **Enviar Contribución**
5. Verás estado: **⏳ Pendiente**

### Como Admin:

1. Clic en **🛡️ Admin** (navbar)
2. Verás la contribución en "Pendientes"
3. Clic en **Ver Detalles**
4. Clic en **✅ Aprobar**
5. ¡Listo! El agricultor recibe sus puntos

### Verificar Resultado:

1. Como agricultor, ve a **Dashboard**
2. Verás tus puntos actualizados
3. En **Mis Contribuciones** verás: **✅ Verificada**

---

## 🎓 Comandos SQL Útiles

```sql
-- Ver todos los admins
SELECT u.email FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Ver contribuciones pendientes
SELECT * FROM contributions WHERE verified = false;

-- Ver contribuciones verificadas
SELECT * FROM contributions WHERE verified = true;

-- Ver historial de verificaciones
SELECT * FROM contribution_verifications
ORDER BY created_at DESC LIMIT 10;

-- Remover admin (si te equivocaste)
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com')
AND role = 'admin';
```

---

## ✅ Checklist Final

- [ ] Script SQL ejecutado ✅
- [ ] Admin creado ✅
- [ ] Sesión refrescada ✅
- [ ] Botón Admin visible ✅
- [ ] Panel accesible ✅
- [ ] Puede aprobar contribuciones ✅
- [ ] Rankings se actualizan ✅

---

## 🎉 ¡Todo Listo!

Ahora tienes un panel de administrador completo para:

- ✅ Verificar contribuciones de agricultores
- ✅ Aprobar o rechazar submissions
- ✅ Ver estadísticas en tiempo real
- ✅ Mantener auditoría completa

**Siguiente paso:** Lee `ADMIN_PANEL.md` para funcionalidades avanzadas.

---

_Tiempo total de setup: ~5 minutos_ ⏱️
