# ✅ Checklist de Implementación - Sistema de Ranking

Este documento te guiará paso a paso para implementar completamente el sistema de ranking en tu proyecto BloomWatch.

## 📋 Preparación Inicial

- [ ] Node.js 18+ instalado
- [ ] npm o yarn configurado
- [ ] Git instalado y configurado
- [ ] Cuenta de Supabase creada
- [ ] Editor de código (VS Code recomendado)

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear Proyecto Supabase

- [ ] Ir a [supabase.com](https://supabase.com)
- [ ] Crear nuevo proyecto
- [ ] Anotar Project URL
- [ ] Anotar anon/public key
- [ ] Esperar a que el proyecto esté listo (~2 minutos)

### Paso 2: Configurar Tablas Básicas

- [ ] Abrir SQL Editor en Supabase
- [ ] Crear tabla `profiles`:
  ```sql
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('agricultor', 'investigador')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Habilitar RLS en `profiles`
- [ ] Crear políticas de seguridad para `profiles`

### Paso 3: Instalar Sistema de Ranking

- [ ] Copiar contenido de `database/farmer-ranking-schema.sql`
- [ ] Pegar en SQL Editor de Supabase
- [ ] Ejecutar el script completo
- [ ] Verificar que se crearon las tablas:
  - [ ] `farmer_rankings`
  - [ ] `contributions`
- [ ] Verificar que se crearon las funciones:
  - [ ] `calculate_farmer_level()`
  - [ ] `update_farmer_ranking()`
  - [ ] `get_top_farmers()`
- [ ] Verificar triggers instalados
- [ ] Verificar índices creados
- [ ] Verificar políticas RLS activas

## 💻 Configuración del Proyecto

### Paso 1: Clonar y Configurar

- [ ] Clonar repositorio: `git clone [url]`
- [ ] Navegar al directorio: `cd NASA`
- [ ] Instalar dependencias: `npm install`
- [ ] Crear archivo `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=tu-url-aqui
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
  ```
- [ ] Verificar que `.env.local` está en `.gitignore`

### Paso 2: Verificar Instalación

- [ ] Iniciar servidor: `npm run dev`
- [ ] Abrir navegador en `http://localhost:3000`
- [ ] Verificar que carga la landing page
- [ ] Verificar que hay sección de ranking
- [ ] Verificar tema claro/oscuro funciona

## 🧪 Pruebas del Sistema

### Paso 1: Crear Usuario de Prueba

- [ ] Ir a `/auth/register`
- [ ] Seleccionar rol: Agricultor
- [ ] Completar formulario de registro
- [ ] Verificar email si es necesario
- [ ] Iniciar sesión correctamente
- [ ] Llegar al dashboard de agricultor

### Paso 2: Verificar Ranking Vacío

- [ ] Ir a `/rankings`
- [ ] Verificar que se muestra mensaje "No hay agricultores"
- [ ] Verificar que las estadísticas muestran 0

### Paso 3: Crear Primera Contribución

#### Opción A: Desde la Aplicación (cuando esté implementado el formulario)

- [ ] Ir al dashboard de agricultor
- [ ] Click en "Agregar Contribución"
- [ ] Seleccionar tipo: "Reporte de Sequía"
- [ ] Escribir descripción detallada
- [ ] Enviar formulario
- [ ] Verificar mensaje de éxito

#### Opción B: Usando la API directamente

- [ ] Obtener token de Supabase desde la consola del navegador:
  ```javascript
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log(session.access_token)
  ```
- [ ] Usar Postman o cURL para crear contribución:
  ```bash
  curl -X POST http://localhost:3000/api/contributions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer TU_TOKEN" \
    -d '{
      "type": "drought_report",
      "description": "Primera prueba de sequía en zona norte",
      "metadata": {"location": "Test"}
    }'
  ```
- [ ] Verificar respuesta exitosa

#### Opción C: Directamente en Supabase

- [ ] Ir a Table Editor en Supabase
- [ ] Abrir tabla `contributions`
- [ ] Click en "Insert row"
- [ ] Llenar campos:
  - farmer_id: [tu UUID de auth.users]
  - type: drought_report
  - points_earned: 50
  - description: "Prueba de contribución"
  - verified: true
- [ ] Guardar

### Paso 4: Verificar Actualización Automática

- [ ] Verificar que se actualizó `farmer_rankings`:
  ```sql
  SELECT * FROM farmer_rankings;
  ```
- [ ] Confirmar:
  - [ ] `total_points` = 50
  - [ ] `level` = "Aprendiz"
  - [ ] `contributions_count` = 1
  - [ ] `drought_reports` = 1

### Paso 5: Verificar Dashboard de Ranking

- [ ] Ir a `/rankings`
- [ ] Verificar que aparece el agricultor
- [ ] Verificar posición: #1 🥇
- [ ] Verificar puntos: 50
- [ ] Verificar nivel: Aprendiz
- [ ] Verificar estadísticas de contribución

## 🎯 Pruebas de Progresión

### Crear Múltiples Contribuciones

- [ ] Opción 1: Usar función SQL helper:
  ```sql
  SELECT insert_sample_contributions(
    'tu-farmer-id-aqui',
    'drought_report',
    5
  );
  ```
- [ ] Opción 2: Ejecutar script de datos de ejemplo:
  - [ ] Editar `database/sample-data.sql`
  - [ ] Reemplazar UUIDs con tus IDs reales
  - [ ] Ejecutar en SQL Editor

### Verificar Cambios de Nivel

- [ ] Agregar 100 pts total → Verificar nivel "Cultivador"
- [ ] Agregar 500 pts total → Verificar nivel "Agricultor Experimentado"
- [ ] Agregar 1,500 pts total → Verificar nivel "Maestro Agricultor"
- [ ] Verificar que el color del badge cambia en `/rankings`

### Verificar Badges

- [ ] Primera contribución → Badge "🌱 Primera Contribución"
- [ ] 10 sequías → Badge "☀️ Experto en Sequías"
- [ ] 10 plagas → Badge "🐛 Cazador de Plagas"
- [ ] Verificar que los badges aparecen en el perfil

## 🌐 Pruebas de API

### GET /api/rankings

- [ ] Sin parámetros: `curl http://localhost:3000/api/rankings`
- [ ] Con límite: `curl http://localhost:3000/api/rankings?limit=5`
- [ ] Por nivel: `curl http://localhost:3000/api/rankings?level=Cultivador`
- [ ] Verificar formato JSON correcto
- [ ] Verificar que incluye `rank_position`

### GET /api/rankings/[id]

- [ ] Con ID válido: `curl http://localhost:3000/api/rankings/[tu-id]`
- [ ] Con ID inválido: Verificar error 404
- [ ] Verificar que incluye toda la información

### GET /api/contributions

- [ ] Sin filtros: `curl http://localhost:3000/api/contributions`
- [ ] Por agricultor: `curl http://localhost:3000/api/contributions?farmerId=[id]`
- [ ] Solo verificadas: `curl http://localhost:3000/api/contributions?verified=true`
- [ ] Por tipo: `curl http://localhost:3000/api/contributions?type=drought_report`

### POST /api/contributions

- [ ] Sin auth: Verificar error 401
- [ ] Con auth válida: Verificar creación exitosa
- [ ] Descripción < 10 chars: Verificar error 400
- [ ] Tipo inválido: Verificar error 400

## 📱 Pruebas de UI

### Landing Page

- [ ] Sección de ranking se muestra correctamente
- [ ] 3 cards de beneficios visibles
- [ ] Botón "Ver Ranking Completo" funciona
- [ ] Redirección a `/rankings` correcta
- [ ] Responsive en móvil
- [ ] Responsive en tablet
- [ ] Responsive en desktop

### Página de Rankings (/rankings)

#### Desktop

- [ ] Header con logo y navegación
- [ ] Estadísticas principales (3 cards)
- [ ] Filtros por nivel funcionan
- [ ] Grid de agricultores se muestra correctamente
- [ ] Medallas para top 3 (🥇🥈🥉)
- [ ] Estadísticas de contribución por tipo
- [ ] Badges se muestran correctamente
- [ ] Animación de loading
- [ ] Mensaje cuando no hay resultados
- [ ] CTA al final funciona

#### Mobile

- [ ] Layout en columna única
- [ ] Todas las estadísticas visibles
- [ ] Filtros en pantalla completa
- [ ] Cards de agricultores legibles
- [ ] Scroll suave

#### Tema Oscuro/Claro

- [ ] Toggle funciona
- [ ] Colores se adaptan correctamente
- [ ] Contraste adecuado en ambos temas
- [ ] Gradientes se ven bien en ambos

### Dashboard de Agricultor

- [ ] Perfil del usuario visible
- [ ] Nivel actual mostrado
- [ ] Puntos totales visibles
- [ ] Progreso al siguiente nivel
- [ ] Badges actuales
- [ ] Botón para agregar contribución
- [ ] Lista de contribuciones propias

## 🔐 Pruebas de Seguridad

### Row Level Security (RLS)

- [ ] Usuario puede ver solo su perfil
- [ ] Usuario puede crear solo sus contribuciones
- [ ] Usuario no puede ver contribuciones no verificadas de otros
- [ ] Usuario no puede modificar contribuciones de otros
- [ ] Rankings son públicos (sin auth)
- [ ] Contribuciones verificadas son públicas

### Validaciones

- [ ] No se pueden crear contribuciones sin autenticación
- [ ] Descripción mínima de 10 caracteres
- [ ] Tipo de contribución debe ser válido
- [ ] Puntos se asignan automáticamente (no pueden manipularse)
- [ ] Solo admin puede verificar contribuciones

## 🚀 Deploy a Producción

### Pre-Deploy

- [ ] Todas las pruebas pasan
- [ ] No hay errores en consola
- [ ] Build exitoso: `npm run build`
- [ ] Verificar en modo producción local: `npm start`
- [ ] Variables de entorno documentadas
- [ ] README actualizado

### Deploy en Vercel

- [ ] Crear cuenta en Vercel
- [ ] Conectar repositorio GitHub
- [ ] Configurar variables de entorno en Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Hacer primer deploy
- [ ] Verificar que funciona en producción
- [ ] Configurar dominio personalizado (opcional)

### Post-Deploy

- [ ] Verificar landing page en producción
- [ ] Verificar `/rankings` en producción
- [ ] Verificar autenticación funciona
- [ ] Verificar API endpoints funcionan
- [ ] Verificar temas claro/oscuro
- [ ] Verificar responsive en diferentes dispositivos
- [ ] Probar crear contribución en producción
- [ ] Verificar que se actualiza el ranking

## 📊 Monitoreo

### Métricas a Vigilar

- [ ] Número total de agricultores registrados
- [ ] Contribuciones por día
- [ ] Distribución por niveles
- [ ] Contribuciones por tipo
- [ ] Tasa de verificación
- [ ] Agricultores activos vs inactivos
- [ ] Tiempo promedio para subir de nivel

### Analytics

- [ ] Configurar Google Analytics (opcional)
- [ ] Configurar Vercel Analytics
- [ ] Tracking de eventos importantes:
  - [ ] Registro de usuario
  - [ ] Creación de contribución
  - [ ] Cambio de nivel
  - [ ] Visitas a ranking

## 🎉 Lanzamiento

### Comunicación

- [ ] Anuncio en redes sociales
- [ ] Email a usuarios potenciales
- [ ] Demo para stakeholders
- [ ] Documentación para usuarios final
- [ ] Video tutorial (opcional)

### Soporte

- [ ] Canal de soporte definido
- [ ] FAQ preparado
- [ ] Guías de usuario
- [ ] Contacto para reporte de bugs

## 🔄 Mantenimiento Continuo

### Diario

- [ ] Revisar errores en logs
- [ ] Verificar contribuciones pendientes
- [ ] Responder consultas de usuarios

### Semanal

- [ ] Análisis de métricas
- [ ] Revisar feedback de usuarios
- [ ] Planear mejoras

### Mensual

- [ ] Backup de base de datos
- [ ] Actualizar dependencias
- [ ] Revisar seguridad
- [ ] Optimizar performance

## ✨ Mejoras Futuras

### Corto Plazo

- [ ] Sistema de notificaciones
- [ ] Dashboard de admin para verificar contribuciones
- [ ] Exportar ranking a PDF
- [ ] Compartir perfil en redes sociales

### Mediano Plazo

- [ ] Sistema de recompensas monetarias
- [ ] Integración con plataforma gubernamental
- [ ] App móvil nativa
- [ ] Sistema de mensajería entre usuarios

### Largo Plazo

- [ ] Blockchain para certificados
- [ ] IA para verificación automática
- [ ] Expansión a otros países
- [ ] Marketplace de productos agrícolas

---

## 🎯 Checklist Rápido para Demo

Si necesitas preparar una demo rápida:

- [ ] Base de datos configurada
- [ ] 3-5 usuarios de ejemplo creados
- [ ] 20-50 contribuciones de ejemplo
- [ ] Agricultores en diferentes niveles
- [ ] Landing page funcionando
- [ ] Ranking público accesible
- [ ] Screenshots/video preparados
- [ ] Historia de usuario lista

---

**¡Éxito con tu implementación!** 🚀

Si encuentras algún problema, revisa:

1. [Documentación completa](./FARMER_RANKING_SYSTEM.md)
2. [Ejemplos de API](./API_EXAMPLES.md)
3. [Guía visual](./VISUAL_GUIDE.md)

Para soporte, contacta al equipo de BloomWatch.
