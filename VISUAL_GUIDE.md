# 🗺️ Guía Visual del Sistema de Ranking

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     BLOOMWATCH - ARQUITECTURA                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   LANDING PAGE  │  ← Landing con info del sistema de ranking
│   /             │  ← Sección destacada con beneficios
└────────┬────────┘  ← CTA para ver ranking completo
         │
         ├──────────┐
         │          │
         ▼          ▼
┌─────────────┐  ┌──────────────────┐
│  RANKING    │  │  AUTENTICACIÓN   │
│  /rankings  │  │  /auth/*         │
│  (PÚBLICO)  │  │                  │
└──────┬──────┘  └────────┬─────────┘
       │                  │
       │                  ▼
       │         ┌─────────────────┐
       │         │  DASHBOARD      │
       │         │  /dashboard/*   │
       │         │  (PRIVADO)      │
       │         └────────┬────────┘
       │                  │
       │                  ▼
       │         ┌─────────────────┐
       │         │  CONTRIBUIR     │
       │         │  (FORMULARIO)   │
       │         └────────┬────────┘
       │                  │
       │                  ▼
       │         ┌─────────────────────────┐
       │         │  API CONTRIBUTIONS      │
       │         │  POST /api/contributions│
       │         └──────────┬──────────────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────────────┐
│       SUPABASE POSTGRESQL            │
│  ┌───────────────┐ ┌──────────────┐ │
│  │farmer_rankings│ │contributions │ │
│  └───────────────┘ └──────────────┘ │
│         ▲                  │         │
│         │  [TRIGGER]       │         │
│         └──────────────────┘         │
└──────────────────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  API RANKINGS           │
│  GET /api/rankings      │
│  GET /api/rankings/[id] │
└─────────────────────────┘
```

## 🔄 Flujo de Usuario - Agricultor

```
┌──────────────┐
│   USUARIO    │
│  (Visitante) │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   1. VER LANDING PAGE                   │
│   • Conoce el sistema de ranking        │
│   • Ve beneficios (contratos, puntos)   │
│   • Click en "Ver Ranking Completo"     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   2. EXPLORAR RANKING PÚBLICO           │
│   • Ve top agricultores                 │
│   • Filtra por nivel                    │
│   • Ve estadísticas de cada uno         │
│   • Decide registrarse                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   3. REGISTRO                           │
│   • Click "Unirse al Ranking"           │
│   • Llena formulario                    │
│   • Selecciona rol: Agricultor          │
│   • Confirma email                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   4. ACCESO AL DASHBOARD                │
│   • Dashboard de agricultor             │
│   • Ve su perfil actual                 │
│   • Nivel: Aprendiz (0 pts)             │
│   • Botón "Agregar Contribución"        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   5. HACER CONTRIBUCIÓN                 │
│   • Selecciona tipo                     │
│     ├─ Sequía → 50 pts                  │
│     ├─ Plaga → 40 pts                   │
│     ├─ Práctica Sostenible → 60 pts     │
│     ├─ Datos de Cultivo → 30 pts        │
│     └─ Datos Climáticos → 20 pts        │
│   • Escribe descripción detallada       │
│   • Agrega metadata (ubicación, etc)    │
│   • Envía formulario                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   6. VERIFICACIÓN                       │
│   • Contribución guardada               │
│   • Estado: "Pendiente de verificación" │
│   • Admin revisa y verifica             │
│   • [TRIGGER AUTOMÁTICO]                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   7. ACTUALIZACIÓN AUTOMÁTICA           │
│   • Puntos sumados                      │
│   • Estadísticas actualizadas           │
│   • Nivel recalculado                   │
│   • Ranking actualizado                 │
│   • Badges desbloqueados (si aplica)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   8. BENEFICIOS                         │
│   • Mejor posición en ranking           │
│   • Acceso a mejores contratos          │
│   • Prioridad en licitaciones           │
│   • Reconocimiento público              │
└─────────────────────────────────────────┘
```

## 🏆 Progresión de Niveles

```
┌─────────────────────────────────────────────────────────────┐
│                     NIVELES DE PROGRESIÓN                   │
└─────────────────────────────────────────────────────────────┘

🌱 APRENDIZ
├─ Puntos: 0 - 99
├─ Color: Gris
├─ Beneficios: Acceso básico
└─ Para alcanzar: Registrarse
          │
          │ +100 puntos
          ▼
🌿 CULTIVADOR
├─ Puntos: 100 - 499
├─ Color: Verde
├─ Beneficios: Prioridad baja en licitaciones
└─ Para alcanzar: 2-5 contribuciones básicas
          │
          │ +400 puntos
          ▼
👨‍🌾 AGRICULTOR EXPERIMENTADO
├─ Puntos: 500 - 1,499
├─ Color: Azul
├─ Beneficios: Prioridad media en licitaciones
└─ Para alcanzar: 10-25 contribuciones
          │
          │ +1,000 puntos
          ▼
🎓 MAESTRO AGRICULTOR
├─ Puntos: 1,500 - 4,999
├─ Color: Morado
├─ Beneficios: Prioridad alta + Badge especial
└─ Para alcanzar: 30-80 contribuciones
          │
          │ +3,500 puntos
          ▼
⭐ GRAN MAESTRO
├─ Puntos: 5,000 - 9,999
├─ Color: Naranja
├─ Beneficios: Acceso a programas especiales
└─ Para alcanzar: 100-150 contribuciones
          │
          │ +5,000 puntos
          ▼
🏆 LEYENDA DEL CAMPO
├─ Puntos: 10,000+
├─ Color: Dorado
├─ Beneficios: Máximo reconocimiento nacional
└─ Para alcanzar: 200+ contribuciones
```

## 📈 Sistema de Puntos Detallado

```
┌─────────────────────────────────────────────────────────────┐
│                  TABLA DE CONTRIBUCIONES                    │
└─────────────────────────────────────────────────────────────┘

╔════════════════════════╦═════════╦════════════════════════╗
║ TIPO DE CONTRIBUCIÓN   ║ PUNTOS  ║ REQUISITOS MÍNIMOS     ║
╠════════════════════════╬═════════╬════════════════════════╣
║ 🌵 Reporte de Sequía   ║  50 pts ║ • Descripción 10+ chars║
║                        ║         ║ • Ubicación            ║
║                        ║         ║ • Nivel de severidad   ║
╠════════════════════════╬═════════╬════════════════════════╣
║ 🐛 Reporte de Plaga    ║  40 pts ║ • Descripción 10+ chars║
║                        ║         ║ • Tipo de plaga        ║
║                        ║         ║ • Área afectada        ║
╠════════════════════════╬═════════╬════════════════════════╣
║ ♻️ Práctica Sostenible ║  60 pts ║ • Descripción 10+ chars║
║                        ║         ║ • Tipo de práctica     ║
║                        ║         ║ • Impacto esperado     ║
╠════════════════════════╬═════════╬════════════════════════╣
║ 📊 Datos de Cultivo    ║  30 pts ║ • Descripción 10+ chars║
║                        ║         ║ • Datos de producción  ║
║                        ║         ║ • Periodo              ║
╠════════════════════════╬═════════╬════════════════════════╣
║ 🌦️ Datos Climáticos    ║  20 pts ║ • Descripción 10+ chars║
║                        ║         ║ • Lecturas precisas    ║
║                        ║         ║ • Fecha y hora         ║
╚════════════════════════╩═════════╩════════════════════════╝

EJEMPLOS DE PROGRESIÓN RÁPIDA:
├─ 10 reportes de sequía = 500 pts → Agricultor Experimentado
├─ 25 prácticas sostenibles = 1,500 pts → Maestro Agricultor
└─ 100 contribuciones mixtas = 4,000-6,000 pts → Gran Maestro
```

## 🎖️ Sistema de Badges

```
┌─────────────────────────────────────────────────────────────┐
│                       INSIGNIAS                             │
└─────────────────────────────────────────────────────────────┘

🌱 PRIMERA CONTRIBUCIÓN
   └─ Requisito: 1 contribución
   └─ Color: Verde
   └─ Descripción: "Realizó su primera contribución"

☀️ EXPERTO EN SEQUÍAS
   └─ Requisito: 10+ reportes de sequía
   └─ Color: Naranja
   └─ Descripción: "Especialista en monitoreo de sequías"

🐛 CAZADOR DE PLAGAS
   └─ Requisito: 10+ reportes de plagas
   └─ Color: Rojo
   └─ Descripción: "Experto en detección de plagas"

♻️ GUERRERO ECOLÓGICO
   └─ Requisito: 5+ prácticas sostenibles
   └─ Color: Esmeralda
   └─ Descripción: "Promotor de agricultura sostenible"

📊 CAMPEÓN DE DATOS
   └─ Requisito: 1,000+ puntos totales
   └─ Color: Azul
   └─ Descripción: "Gran contribuidor de datos"

👨‍🌾 MAESTRO AGRICULTOR
   └─ Requisito: Alcanzar nivel "Maestro Agricultor"
   └─ Color: Morado
   └─ Descripción: "Dominio de técnicas agrícolas"

🏆 LEYENDA VIVA
   └─ Requisito: Alcanzar nivel "Leyenda del Campo"
   └─ Color: Dorado
   └─ Descripción: "Máximo exponente de la agricultura"
```

## 🔗 Estructura de URLs

```
PÚBLICAS (Sin autenticación):
├─ /                    → Landing page
├─ /rankings            → Dashboard de rankings
├─ /auth/login          → Inicio de sesión
└─ /auth/register       → Registro

PRIVADAS (Requiere autenticación):
├─ /dashboard/farmer    → Dashboard agricultor
└─ /dashboard/researcher → Dashboard investigador

API ENDPOINTS:
├─ GET  /api/rankings              → Top agricultores
├─ GET  /api/rankings/[id]         → Ranking específico
├─ GET  /api/contributions         → Listar contribuciones
└─ POST /api/contributions         → Crear contribución
```

## 💾 Estructura de Base de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                    TABLAS PRINCIPALES                        │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   farmer_rankings       │
├─────────────────────────┤
│ • id (UUID)             │
│ • farmer_id (UUID) FK   │
│ • farmer_name           │
│ • total_points (INT)    │
│ • level (VARCHAR)       │
│ • contributions_count   │
│ • drought_reports       │
│ • pest_reports          │
│ • sustainable_practices │
│ • crop_data_shared      │
│ • weather_data_shared   │
│ • badges (JSONB)        │
│ • avatar_url            │
│ • location              │
│ • created_at            │
│ • updated_at            │
└────────┬────────────────┘
         │
         │ One to Many
         │
         ▼
┌─────────────────────────┐
│   contributions         │
├─────────────────────────┤
│ • id (UUID)             │
│ • farmer_id (UUID) FK   │
│ • type (VARCHAR)        │
│ • points_earned (INT)   │
│ • description (TEXT)    │
│ • verified (BOOLEAN)    │
│ • metadata (JSONB)      │
│ • created_at            │
│ • updated_at            │
└─────────────────────────┘

FUNCIONES AUTOMÁTICAS:
├─ calculate_farmer_level()     → Calcula nivel por puntos
├─ update_farmer_ranking()      → Trigger post-verificación
└─ get_top_farmers(limit)       → Query optimizada con ranking
```

## 🚀 Despliegue y Configuración

```
PASO 1: CLONAR REPOSITORIO
├─ git clone <repo>
└─ cd NASA

PASO 2: INSTALAR DEPENDENCIAS
├─ npm install
└─ Tiempo estimado: 2-3 minutos

PASO 3: CONFIGURAR SUPABASE
├─ Crear proyecto en supabase.com
├─ Copiar URL y anon key
├─ Crear .env.local
├─ Ejecutar farmer-ranking-schema.sql
└─ Tiempo estimado: 10-15 minutos

PASO 4: INICIAR DESARROLLO
├─ npm run dev
├─ Abrir http://localhost:3000
└─ Listo para usar!

PASO 5: DESPLEGAR A PRODUCCIÓN
├─ Conectar con Vercel
├─ Agregar variables de entorno
├─ Deploy automático desde main
└─ Tiempo estimado: 5 minutos
```

## 📱 Responsive Design

```
MOBILE (< 768px)
├─ Menú hamburguesa
├─ Cards en columna única
├─ Tablas con scroll horizontal
└─ Navegación simplificada

TABLET (768px - 1024px)
├─ Grid de 2 columnas
├─ Sidebar colapsable
└─ Navegación completa

DESKTOP (> 1024px)
├─ Grid de 3 columnas
├─ Sidebar fijo
├─ Todos los elementos visibles
└─ Experiencia completa
```

---

**🎯 Próximos Pasos Recomendados:**

1. ✅ Configurar base de datos en Supabase
2. ✅ Probar endpoints de API
3. ✅ Crear primeras contribuciones de prueba
4. ✅ Ver actualización de ranking en tiempo real
5. ✅ Desplegar a producción

**📚 Documentación Adicional:**
- [Sistema de Ranking Completo](./FARMER_RANKING_SYSTEM.md)
- [Ejemplos de API](./API_EXAMPLES.md)
- [Configuración de Supabase](./SUPABASE_SETUP.md)

---

**Desarrollado para BloomWatch - NASA Space Apps Challenge 2025** 🚀🌽
