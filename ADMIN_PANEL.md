# 🛡️ Panel de Administrador - BloomWatch

## 📋 Descripción

Sistema completo de administración para verificar contribuciones de agricultores en BloomWatch. Incluye panel de control, API segura, sistema de roles y auditoría.

---

## ✨ Características

### ✅ Panel de Control

- Lista de todas las contribuciones (pendientes/verificadas)
- Búsqueda en tiempo real
- Filtros por estado
- Vista detallada de cada contribución
- Estadísticas en tiempo real
- Interfaz responsive y moderna

### ✅ Sistema de Seguridad

- Autenticación requerida
- Verificación de rol admin
- Protección de rutas API
- Row Level Security (RLS) en base de datos
- Logs de auditoría

### ✅ Acciones de Admin

- ✅ Aprobar contribuciones
- ❌ Rechazar contribuciones
- 🔄 Revocar verificaciones
- 📊 Ver historial completo
- 👤 Ver información del agricultor

---

## 🗄️ Estructura de Base de Datos

### Tabla: `user_roles`

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(50) CHECK (role IN ('admin', 'farmer', 'researcher')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, role)
);
```

**Roles disponibles:**

- `admin`: Acceso total al panel de administración
- `farmer`: Agricultor estándar
- `researcher`: Investigador

### Tabla: `contribution_verifications`

```sql
CREATE TABLE public.contribution_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID REFERENCES contributions(id),
    verified_by UUID REFERENCES auth.users(id),
    previous_status BOOLEAN,
    new_status BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now()
);
```

**Propósito:** Registro de auditoría de todas las verificaciones.

---

## 🚀 Instalación y Configuración

### 1. Ejecutar Script de Base de Datos

```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar: database/admin-roles.sql
```

Este script crea:

- ✅ Tabla `user_roles`
- ✅ Tabla `contribution_verifications`
- ✅ Políticas RLS
- ✅ Función `is_admin()`
- ✅ Función `make_user_admin()`
- ✅ Índices de rendimiento

### 2. Crear Tu Primer Admin

En Supabase SQL Editor:

```sql
-- Reemplaza con tu email real
SELECT public.make_user_admin('tu-email@ejemplo.com');
```

**Respuesta esperada:**

```
"Usuario tu-email@ejemplo.com es ahora administrador"
```

### 3. Verificar Rol Admin

```sql
-- Ver todos los admins
SELECT u.email, ur.granted_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

### 4. Refrescar Sesión

**Importante:** Después de otorgar el rol admin:

1. Cierra sesión en BloomWatch
2. Vuelve a iniciar sesión
3. Deberías ver el botón "Admin" en el navbar

---

## 📡 API Endpoints

### PATCH `/api/admin/contributions/[id]/verify`

Verifica o revoca una contribución.

**Headers:**

```typescript
{
  "Authorization": "Bearer <session_token>",
  "Content-Type": "application/json"
}
```

**Body:**

```typescript
{
  "verified": boolean,  // true = aprobar, false = rechazar
  "notes": string       // opcional
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Contribución verificada exitosamente",
  "data": {
    "id": "uuid",
    "verified": true,
    "updated_at": "2025-10-04T..."
  }
}
```

**Errores:**

- `401`: No autenticado
- `403`: No es admin
- `404`: Contribución no encontrada
- `500`: Error del servidor

### GET `/api/admin/contributions/[id]/verify`

Obtiene el historial de verificaciones de una contribución.

**Headers:**

```typescript
{
  "Authorization": "Bearer <session_token>"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "contribution_id": "uuid",
      "verified_by": "uuid",
      "previous_status": false,
      "new_status": true,
      "notes": "Aprobada por administrador",
      "created_at": "2025-10-04T...",
      "verifier": {
        "email": "admin@ejemplo.com"
      }
    }
  ]
}
```

---

## 💻 Uso del Panel

### Acceder al Panel

**URL:** `http://localhost:3000/admin/contributions`

**Requisitos:**

- ✅ Usuario autenticado
- ✅ Rol de admin asignado
- ✅ Sesión activa

### Flujo de Verificación

1. **Ver Contribuciones Pendientes**

   - El panel muestra automáticamente contribuciones pendientes
   - Usa filtros: "Todas", "Pendientes", "Verificadas"

2. **Buscar Contribución**

   - Busca por nombre de agricultor, email o descripción
   - Búsqueda en tiempo real

3. **Ver Detalles**

   - Clic en "Ver Detalles" para información completa
   - Revisa tipo, descripción, puntos y agricultor

4. **Aprobar/Rechazar**

   - **Aprobar:** ✅ Marca como verificada y otorga puntos
   - **Rechazar:** ❌ Mantiene sin verificar, no otorga puntos
   - **Revocar:** 🔄 Quita verificación de una aprobada

5. **Resultado Automático**
   - Actualización inmediata del ranking del agricultor
   - Registro en tabla de auditoría
   - Notificación visual de éxito

---

## 🔐 Seguridad

### Niveles de Protección

1. **Frontend:**

   - Verificación de rol con `isAdmin()`
   - Redirección si no es admin
   - Estado de loading durante verificación

2. **API:**

   - Token de sesión requerido
   - Validación de rol admin en cada request
   - Error 403 si no es admin

3. **Base de Datos:**
   - Row Level Security (RLS)
   - Solo admins pueden modificar roles
   - Solo admins pueden ver auditoría

### Políticas RLS

```sql
-- Solo admins pueden insertar roles
CREATE POLICY "Only admins can insert roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
```

---

## 📊 Estadísticas y Métricas

El panel muestra en tiempo real:

- **Pendientes:** Contribuciones sin verificar (⏳ Naranja)
- **Verificadas:** Contribuciones aprobadas (✅ Verde)
- **Total:** Todas las contribuciones (📈 Azul)

---

## 🐛 Troubleshooting

### No veo el botón "Admin" en navbar

**Solución:**

```sql
-- Verificar si tienes rol admin
SELECT public.is_admin(auth.uid());

-- Si retorna false, ejecuta:
SELECT public.make_user_admin('tu-email@ejemplo.com');

-- Luego cierra sesión y vuelve a entrar
```

### Error 403: Acceso Denegado

**Causas comunes:**

1. No tienes rol admin asignado
2. Sesión expirada
3. No ejecutaste el script SQL

**Solución:**

```bash
# 1. Verificar en Supabase que exista la tabla user_roles
# 2. Verificar que tu usuario tenga rol admin
# 3. Cerrar sesión y volver a entrar
```

### Las contribuciones no se actualizan

**Solución:**

1. Verifica que el trigger `update_ranking_on_verification` esté activo
2. Ejecuta manualmente:

```sql
SELECT update_farmer_ranking('farmer_id_aqui');
```

### No se cargan los datos del agricultor

**Problema:** La API `getUserById` requiere permisos especiales.

**Solución temporal:**
Los datos se obtienen de `farmer_rankings` que tiene la información pública.

---

## 🎨 Personalización

### Cambiar Colores de Estado

En `/src/app/admin/contributions/page.tsx`:

```typescript
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    drought_report: 'bg-red-500/10 text-red-500', // Cambiar aquí
    pest_report: 'bg-orange-500/10 text-orange-500', // Cambiar aquí
    // ...
  }
  return colors[type]
}
```

### Agregar Filtros Adicionales

```typescript
// Ejemplo: Filtrar por rango de fechas
const [dateRange, setDateRange] = useState({ start: '', end: '' })

const filteredByDate = filteredContributions.filter((c) => {
  if (!dateRange.start || !dateRange.end) return true
  const date = new Date(c.created_at)
  return date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
})
```

---

## 📈 Mejoras Futuras

### V2.0 - Funcionalidades Planeadas

- [ ] **Verificación en Lote:** Aprobar múltiples contribuciones
- [ ] **Comentarios:** Dejar feedback al agricultor
- [ ] **Notificaciones:** Email cuando se verifica una contribución
- [ ] **Dashboard de Métricas:** Gráficas de contribuciones por tipo
- [ ] **Export a CSV:** Descargar reporte de contribuciones
- [ ] **Filtros Avanzados:** Por agricultor, región, puntos
- [ ] **Imágenes:** Soporte para subir evidencia fotográfica
- [ ] **Geolocalización:** Mapa de contribuciones verificadas

---

## 🧪 Testing

### Crear Contribución de Prueba

```typescript
// En /contributions como agricultor
{
  "type": "drought_report",
  "description": "Prueba de sequía en zona norte - testing admin panel",
  "points_earned": 50
}
```

### Verificar Contribución

1. Ve a `/admin/contributions`
2. Deberías ver la contribución en "Pendientes"
3. Clic en "Ver Detalles"
4. Clic en "Aprobar"
5. Verifica que:
   - ✅ Estado cambia a "Verificada"
   - ✅ Ranking del agricultor se actualiza (+50 pts)
   - ✅ Aparece en tabla `contribution_verifications`

---

## 📚 Archivos Relacionados

```
📁 BloomWatch/
├── 📁 database/
│   └── admin-roles.sql              # Script de instalación
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 admin/
│   │   │   └── 📁 contributions/
│   │   │       └── page.tsx         # Panel de admin
│   │   └── 📁 api/
│   │       └── 📁 admin/
│   │           └── 📁 contributions/
│   │               └── 📁 [id]/
│   │                   └── 📁 verify/
│   │                       └── route.ts  # API endpoint
│   ├── 📁 lib/
│   │   └── auth-helpers.ts          # Funciones de roles
│   └── 📁 components/
│       └── 📁 layout/
│           └── navbar.tsx           # Navbar con botón admin
└── 📄 ADMIN_PANEL.md                # Esta documentación
```

---

## 🆘 Soporte

### Comandos Útiles

```sql
-- Ver todos los admins
SELECT u.email FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Ver historial de verificaciones
SELECT * FROM contribution_verifications
ORDER BY created_at DESC
LIMIT 10;

-- Ver contribuciones pendientes
SELECT * FROM contributions
WHERE verified = false
ORDER BY created_at DESC;

-- Hacer admin a un usuario
SELECT make_user_admin('email@ejemplo.com');

-- Remover rol admin
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com')
AND role = 'admin';
```

---

## ✅ Checklist de Implementación

- [x] Script SQL ejecutado
- [x] Primer admin creado
- [x] Rol verificado en base de datos
- [x] Panel accesible en `/admin/contributions`
- [x] Botón "Admin" visible en navbar
- [x] Puede aprobar contribuciones
- [x] Puede rechazar contribuciones
- [x] Puede revocar verificaciones
- [x] Rankings se actualizan automáticamente
- [x] Auditoría registrando cambios

---

## 📞 Contacto

Para reportar bugs o sugerir mejoras, crea un issue en el repositorio o contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Fecha:** Octubre 2025  
**Proyecto:** BloomWatch - NASA Space Apps Challenge
