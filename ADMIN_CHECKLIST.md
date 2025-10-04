# ✅ Checklist de Implementación - Panel de Admin

## 🎯 Sigue estos pasos en orden

---

## 📋 Fase 1: Instalación de Base de Datos (5 min)

### Paso 1.1: Abrir Supabase Dashboard
- [ ] Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Seleccionar tu proyecto BloomWatch
- [ ] Ir a **SQL Editor** en el menú lateral

### Paso 1.2: Ejecutar Script SQL
- [ ] Abrir archivo `database/admin-roles.sql` en tu editor
- [ ] Copiar **TODO** el contenido del archivo
- [ ] Pegar en Supabase SQL Editor
- [ ] Clic en **RUN** (botón verde)
- [ ] Esperar mensaje: ✅ Success. No rows returned

### Paso 1.3: Verificar Creación de Tablas
```sql
-- Ejecuta esto en SQL Editor:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'contribution_verifications');
```
- [ ] Deberías ver 2 tablas: `user_roles` y `contribution_verifications`

---

## 👤 Fase 2: Crear Primer Admin (2 min)

### Paso 2.1: Obtener tu Email
- [ ] Identifica el email con el que te registraste en BloomWatch
- [ ] Ejemplo: `tu-email@ejemplo.com`

### Paso 2.2: Ejecutar Función Make Admin
```sql
-- En Supabase SQL Editor:
SELECT public.make_user_admin('TU-EMAIL-AQUI@ejemplo.com');
```
- [ ] Reemplazar `TU-EMAIL-AQUI` con tu email real
- [ ] Clic en **RUN**
- [ ] Deberías ver: `"Usuario tu-email@ejemplo.com es ahora administrador"`

### Paso 2.3: Verificar Rol Admin
```sql
-- En Supabase SQL Editor:
SELECT u.email, ur.role, ur.granted_at 
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```
- [ ] Tu email debe aparecer en la lista
- [ ] Con role = 'admin'
- [ ] Con fecha de hoy en granted_at

---

## 🔄 Fase 3: Refrescar Sesión (1 min)

### Paso 3.1: Cerrar Sesión
- [ ] Ir a BloomWatch en el navegador
- [ ] Clic en tu nombre de usuario (arriba derecha)
- [ ] Clic en **Salir** / **Logout**
- [ ] Deberías ver la pantalla de login

### Paso 3.2: Iniciar Sesión Nuevamente
- [ ] Usar tu email y contraseña
- [ ] Clic en **Iniciar Sesión**
- [ ] Esperar a que cargue el dashboard

### Paso 3.3: Verificar Botón Admin
- [ ] Buscar en el navbar (arriba)
- [ ] Deberías ver: **🛡️ Admin** (en color naranja)
- [ ] Si NO lo ves, repite Fase 2 y 3

---

## 🎨 Fase 4: Acceder al Panel (1 min)

### Paso 4.1: Clic en Botón Admin
- [ ] Clic en **🛡️ Admin** en el navbar
- [ ] O ir manualmente a: `http://localhost:3000/admin/contributions`

### Paso 4.2: Verificar Carga del Panel
- [ ] Deberías ver el título: "Panel de Administrador"
- [ ] Deberías ver 3 estadísticas (Pendientes/Verificadas/Total)
- [ ] Deberías ver barra de búsqueda
- [ ] Deberías ver botones de filtro

### Paso 4.3: Estado Inicial
Si no hay contribuciones:
- [ ] Verás mensaje: "No se encontraron contribuciones"
- [ ] Esto es normal si es primera vez

---

## 🧪 Fase 5: Crear Contribución de Prueba (3 min)

### Paso 5.1: Cambiar a Rol Agricultor
- [ ] Cerrar sesión del admin
- [ ] Iniciar sesión con cuenta de agricultor
- [ ] (O crear una nueva cuenta de agricultor si no tienes)

### Paso 5.2: Ir a Página de Contribuciones
- [ ] Clic en **Contribuir** en el navbar
- [ ] O ir a: `http://localhost:3000/contributions`

### Paso 5.3: Crear Contribución
- [ ] Seleccionar tipo: **Reporte de Sequía**
- [ ] Descripción: "Prueba de sequía en zona norte - testing admin panel"
- [ ] Clic en **Enviar Contribución**
- [ ] Deberías ver mensaje de éxito
- [ ] Estado: ⏳ Pendiente

### Paso 5.4: Verificar en Dashboard
- [ ] Ir a **Dashboard** (navbar)
- [ ] Scroll hasta "Mis Contribuciones"
- [ ] Deberías ver la contribución con estado **Pendiente**

---

## ✅ Fase 6: Verificar Contribución como Admin (2 min)

### Paso 6.1: Volver a Cuenta Admin
- [ ] Cerrar sesión del agricultor
- [ ] Iniciar sesión con cuenta admin
- [ ] Deberías ver botón **🛡️ Admin**

### Paso 6.2: Abrir Panel de Admin
- [ ] Clic en **🛡️ Admin**
- [ ] Deberías ver 1 contribución pendiente

### Paso 6.3: Ver Detalles de Contribución
- [ ] Clic en **👁️ Ver Detalles**
- [ ] Deberías ver modal con información completa
- [ ] Verificar:
  - [ ] Tipo: Reporte de Sequía
  - [ ] Descripción correcta
  - [ ] Puntos: +50 pts
  - [ ] Estado: Pendiente
  - [ ] Nombre del agricultor

### Paso 6.4: Aprobar Contribución
- [ ] Clic en **✅ Aprobar** (botón verde)
- [ ] Esperar procesamiento (1-2 segundos)
- [ ] Deberías ver:
  - [ ] Mensaje de éxito
  - [ ] Estado cambia a "Verificada"
  - [ ] Contribución desaparece de "Pendientes"
  - [ ] Aparece en "Verificadas"

---

## 🎯 Fase 7: Verificar Actualización de Ranking (2 min)

### Paso 7.1: Ver Ranking del Agricultor
- [ ] Ir a **Ranking** en navbar
- [ ] O ir a: `http://localhost:3000/rankings`
- [ ] Buscar el nombre del agricultor
- [ ] Verificar que tiene los puntos actualizados (+50)

### Paso 7.2: Verificar como Agricultor
- [ ] Cerrar sesión del admin
- [ ] Iniciar sesión con cuenta de agricultor
- [ ] Ir a **Dashboard**
- [ ] Verificar:
  - [ ] Puntos totales aumentaron (+50)
  - [ ] Contribución muestra estado **✅ Verificada**
  - [ ] Posible cambio de nivel (si tenía puntos cerca)

---

## 📊 Fase 8: Probar Otras Funcionalidades (5 min)

### Paso 8.1: Búsqueda
- [ ] Volver a cuenta admin
- [ ] Ir al panel admin
- [ ] Escribir en búsqueda: nombre del agricultor
- [ ] Verificar que filtra correctamente

### Paso 8.2: Filtros
- [ ] Clic en botón **Todas**
- [ ] Verificar que muestra todas las contribuciones
- [ ] Clic en botón **Pendientes**
- [ ] Verificar que solo muestra pendientes
- [ ] Clic en botón **Verificadas**
- [ ] Verificar que solo muestra verificadas

### Paso 8.3: Revocar Verificación
- [ ] Ir a filtro **Verificadas**
- [ ] Seleccionar la contribución de prueba
- [ ] Clic en **🔄 Revocar Verificación**
- [ ] Verificar:
  - [ ] Estado vuelve a "Pendiente"
  - [ ] Puntos se recalculan automáticamente
  - [ ] Ranking del agricultor se actualiza

### Paso 8.4: Rechazar Contribución
- [ ] Crear nueva contribución de prueba como agricultor
- [ ] Volver a admin
- [ ] Clic en **❌ Rechazar**
- [ ] Verificar que permanece sin verificar (sin puntos)

---

## 🔍 Fase 9: Verificar Base de Datos (opcional)

### Paso 9.1: Ver Tabla user_roles
```sql
SELECT * FROM public.user_roles;
```
- [ ] Deberías ver tu registro como admin

### Paso 9.2: Ver Auditoría
```sql
SELECT * FROM public.contribution_verifications 
ORDER BY created_at DESC;
```
- [ ] Deberías ver registro de tus verificaciones
- [ ] Con tu user_id en verified_by
- [ ] Con previous_status y new_status

### Paso 9.3: Ver Contribuciones
```sql
SELECT id, type, verified, points_earned 
FROM public.contributions 
ORDER BY created_at DESC;
```
- [ ] Verificar estados correctos
- [ ] Verificar puntos asignados

---

## 🎨 Fase 10: Probar Responsiveness (opcional)

### Paso 10.1: Modo Desktop
- [ ] Ventana completa del navegador
- [ ] Panel debe verse en layout de 3 columnas
- [ ] Estadísticas lado a lado
- [ ] Acciones inline en cards

### Paso 10.2: Modo Tablet
- [ ] Redimensionar ventana a ~800px
- [ ] Estadísticas en 2 columnas
- [ ] Filtros se apilan
- [ ] Cards más compactas

### Paso 10.3: Modo Mobile
- [ ] Redimensionar ventana a ~400px
- [ ] Todo apilado verticalmente
- [ ] Botones full-width
- [ ] Scroll suave

### Paso 10.4: Dark Mode
- [ ] Clic en toggle de tema (☀️/🌙)
- [ ] Verificar que todo se ve bien en dark mode
- [ ] Colores apropiados
- [ ] Contraste legible

---

## 🐛 Troubleshooting Checklist

### ❌ "No veo el botón Admin"
- [ ] Verificar que ejecutaste el script SQL
- [ ] Verificar que tienes rol admin en base de datos
- [ ] Cerrar sesión y volver a entrar
- [ ] Limpiar caché del navegador (Ctrl+Shift+R)

### ❌ "Error 403: Acceso Denegado"
- [ ] Re-ejecutar: `SELECT make_user_admin('tu-email@ejemplo.com')`
- [ ] Verificar email exacto en auth.users
- [ ] Cerrar sesión completamente
- [ ] Iniciar sesión de nuevo

### ❌ "No se cargan las contribuciones"
- [ ] Verificar que hay contribuciones en la base de datos
- [ ] Abrir consola del navegador (F12)
- [ ] Buscar errores en Network tab
- [ ] Verificar que API está respondiendo

### ❌ "Los puntos no se actualizan"
- [ ] Verificar que el trigger está activo:
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'update_ranking_on_verification';
```
- [ ] Ejecutar manualmente:
```sql
SELECT update_farmer_ranking('farmer_id_aqui');
```

---

## ✅ Checklist Final de Validación

### Sistema de Roles
- [ ] ✅ Admin puede acceder al panel
- [ ] ✅ Agricultor NO puede acceder al panel (redirect)
- [ ] ✅ Usuario no autenticado NO puede acceder (redirect)

### Panel de Admin
- [ ] ✅ Carga lista de contribuciones
- [ ] ✅ Muestra estadísticas correctas
- [ ] ✅ Búsqueda funciona
- [ ] ✅ Filtros funcionan
- [ ] ✅ Modal de detalles funciona

### Acciones de Verificación
- [ ] ✅ Puede aprobar contribuciones
- [ ] ✅ Puede rechazar contribuciones
- [ ] ✅ Puede revocar verificaciones
- [ ] ✅ Rankings se actualizan automáticamente
- [ ] ✅ Auditoría se registra correctamente

### UI/UX
- [ ] ✅ Responsive en todos los tamaños
- [ ] ✅ Dark mode funciona correctamente
- [ ] ✅ Loading states apropiados
- [ ] ✅ Feedback visual claro
- [ ] ✅ Sin errores en consola

### Build & Deploy
- [ ] ✅ `npm run build` exitoso
- [ ] ✅ Sin errores de TypeScript
- [ ] ✅ Sin warnings de ESLint
- [ ] ✅ Todas las rutas generadas
- [ ] ✅ Sin errores de compilación

---

## 🎉 ¡Implementación Completada!

Si todos los checkboxes están marcados, tu panel de administrador está:
- ✅ **Completamente funcional**
- ✅ **Seguro y protegido**
- ✅ **Listo para producción**
- ✅ **Bien documentado**

---

## 📚 Próximos Pasos

1. **Producción:**
   - [ ] Deploy a Vercel/Railway/otro hosting
   - [ ] Configurar variables de entorno en producción
   - [ ] Crear admin en base de datos de producción

2. **Mejoras Futuras:**
   - [ ] Agregar notificaciones por email
   - [ ] Dashboard de métricas con gráficas
   - [ ] Export de datos a CSV
   - [ ] Sistema de comentarios
   - [ ] Verificación en lote

3. **Documentación:**
   - [ ] Leer `ADMIN_PANEL.md` completo
   - [ ] Revisar `ADMIN_VISUAL_GUIDE.md`
   - [ ] Compartir con tu equipo

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa la sección de Troubleshooting
2. Lee `ADMIN_PANEL.md` para más detalles
3. Verifica la consola del navegador (F12)
4. Revisa los logs de Supabase

---

**Tiempo total estimado:** 20-30 minutos  
**Dificultad:** Media  
**Estado:** ✅ Completable siguiendo este checklist

---

*Última actualización: 4 de Octubre 2025*
