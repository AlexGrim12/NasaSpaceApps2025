# Sistema de Ranking de Agricultores - BloomWatch

## 📋 Descripción General

El Sistema de Ranking de Agricultores es una funcionalidad completa que reconoce y recompensa a los agricultores que contribuyen con información valiosa sobre condiciones climáticas, plagas, prácticas sostenibles y datos de cultivos. Este sistema les permite acceder a mejores contratos y licitaciones gubernamentales.

## 🎯 Características Principales

### 1. Sistema de Puntos
Los agricultores ganan puntos por diferentes tipos de contribuciones:

| Tipo de Contribución | Puntos | Descripción |
|---------------------|---------|-------------|
| Reporte de Sequías | 50 pts | Información sobre períodos de sequía |
| Reporte de Plagas | 40 pts | Detección y reporte de plagas |
| Prácticas Sostenibles | 60 pts | Uso de métodos socialmente responsables |
| Datos de Cultivos | 30 pts | Compartir datos de producción y cosecha |
| Datos Climáticos | 20 pts | Información meteorológica local |

### 2. Sistema de Niveles

Los agricultores progresan a través de diferentes niveles según sus puntos acumulados:

| Nivel | Puntos Requeridos | Beneficios |
|-------|-------------------|------------|
| 🌱 Aprendiz | 0 - 99 pts | Acceso básico a la plataforma |
| 🌿 Cultivador | 100 - 499 pts | Prioridad baja en licitaciones |
| 👨‍🌾 Agricultor Experimentado | 500 - 1,499 pts | Prioridad media en licitaciones |
| 🎓 Maestro Agricultor | 1,500 - 4,999 pts | Prioridad alta en licitaciones |
| ⭐ Gran Maestro | 5,000 - 9,999 pts | Acceso a programas especiales |
| 🏆 Leyenda del Campo | 10,000+ pts | Máximos beneficios y reconocimiento nacional |

### 3. Sistema de Insignias

Los agricultores pueden ganar insignias especiales:

- 🌱 **Primera Contribución**: Por realizar la primera contribución
- ☀️ **Experto en Sequías**: Por reportar 10+ sequías
- 🐛 **Cazador de Plagas**: Por reportar 10+ plagas
- ♻️ **Guerrero Ecológico**: Por 5+ prácticas sostenibles
- 📊 **Campeón de Datos**: Por alcanzar 1,000 puntos
- 👨‍🌾 **Maestro Agricultor**: Por alcanzar el nivel Maestro
- 🏆 **Leyenda Viva**: Por alcanzar el nivel máximo

### 4. Dashboard Público

- **URL**: `/rankings`
- **Acceso**: Público (no requiere autenticación)
- **Características**:
  - Top 100 agricultores ordenados por puntos
  - Filtros por nivel
  - Estadísticas generales
  - Medallas para top 3 (🥇🥈🥉)
  - Desglose de contribuciones por tipo
  - Insignias visuales
  - Información de ubicación
  - Fecha de registro

## 🗄️ Estructura de la Base de Datos

### Tabla: `farmer_rankings`

Almacena el ranking y estadísticas de cada agricultor.

```sql
CREATE TABLE farmer_rankings (
    id UUID PRIMARY KEY,
    farmer_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    farmer_name VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT 'Aprendiz',
    contributions_count INTEGER DEFAULT 0,
    drought_reports INTEGER DEFAULT 0,
    pest_reports INTEGER DEFAULT 0,
    sustainable_practices INTEGER DEFAULT 0,
    crop_data_shared INTEGER DEFAULT 0,
    weather_data_shared INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    avatar_url TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Tabla: `contributions`

Registra cada contribución realizada.

```sql
CREATE TABLE contributions (
    id UUID PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES auth.users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'drought_report',
        'pest_report',
        'sustainable_practice',
        'crop_data',
        'weather_data'
    )),
    points_earned INTEGER NOT NULL,
    description TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Funciones PostgreSQL

#### `calculate_farmer_level(points INTEGER)`
Calcula el nivel del agricultor basado en sus puntos totales.

#### `update_farmer_ranking()`
Trigger que actualiza automáticamente el ranking cuando se verifica una contribución.

#### `get_top_farmers(limit_count INTEGER)`
Obtiene el top de agricultores con su posición en el ranking.

## 🔌 API Endpoints

### 1. Obtener Rankings

**GET** `/api/rankings`

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados (default: 100)
- `level` (opcional): Filtrar por nivel específico

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "farmer_id": "uuid",
      "farmer_name": "Juan Pérez",
      "total_points": 5200,
      "level": "Gran Maestro",
      "contributions_count": 104,
      "drought_reports": 25,
      "pest_reports": 30,
      "sustainable_practices": 20,
      "crop_data_shared": 20,
      "weather_data_shared": 9,
      "badges": ["first_contribution", "drought_expert", "pest_hunter"],
      "location": "Jalisco, México",
      "rank_position": 1,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2025-10-04T15:30:00Z"
    }
  ],
  "count": 1
}
```

### 2. Obtener Ranking de un Agricultor

**GET** `/api/rankings/[id]`

**Parámetros de ruta:**
- `id`: ID del agricultor (UUID)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    // ... mismo formato que el endpoint anterior
    "rank_position": 1
  }
}
```

### 3. Obtener Contribuciones

**GET** `/api/contributions`

**Query Parameters:**
- `farmerId` (opcional): ID del agricultor
- `type` (opcional): Tipo de contribución
- `verified` (opcional): true/false

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "farmer_id": "uuid",
      "type": "drought_report",
      "points_earned": 50,
      "description": "Sequía severa en zona norte",
      "verified": true,
      "metadata": {},
      "created_at": "2025-10-04T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 4. Crear Contribución

**POST** `/api/contributions`

**Headers:**
- `Authorization`: Bearer token (usuario autenticado)

**Body:**
```json
{
  "type": "drought_report",
  "description": "Descripción detallada de la contribución (mínimo 10 caracteres)",
  "metadata": {
    "location": "Jalisco",
    "severity": "high"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "farmer_id": "uuid",
    "type": "drought_report",
    "points_earned": 50,
    "description": "...",
    "verified": false,
    "created_at": "2025-10-04T10:00:00Z"
  },
  "message": "Contribución creada exitosamente. Está pendiente de verificación."
}
```

## 🚀 Instalación y Configuración

### 1. Configurar la Base de Datos

1. Accede a tu proyecto de Supabase
2. Ve a SQL Editor
3. Copia y pega el contenido de `database/farmer-ranking-schema.sql`
4. Ejecuta el script

### 2. Configurar Variables de Entorno

Asegúrate de tener configurado `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

## 📱 Uso del Sistema

### Para Agricultores

1. **Registrarse**: Crear cuenta como agricultor en `/auth/register?role=agricultor`
2. **Contribuir**: Desde el dashboard, reportar sequías, plagas o compartir datos
3. **Ganar Puntos**: Las contribuciones verificadas otorgan puntos automáticamente
4. **Subir de Nivel**: Acumular puntos para desbloquear niveles superiores
5. **Ganar Insignias**: Completar logros especiales
6. **Ver Ranking**: Consultar posición en `/rankings`

### Para Administradores

1. **Verificar Contribuciones**: Revisar y aprobar contribuciones pendientes
2. **Asignar Puntos**: El sistema asigna puntos automáticamente al verificar
3. **Actualizar Niveles**: Se actualizan automáticamente con triggers

### Para Gobierno/Empresas

1. **Consultar Rankings**: Ver `/rankings` sin necesidad de cuenta
2. **Identificar Top Agricultores**: Filtrar por nivel y ubicación
3. **Contactar para Licitaciones**: Priorizar agricultores mejor rankeados

## 🎨 Componentes de UI

### Página de Rankings (`/rankings`)

Componente: `src/app/rankings/page.tsx`

**Características**:
- Grid responsivo
- Tarjetas de agricultores con información detallada
- Filtros dinámicos por nivel
- Estadísticas en tiempo real
- Animaciones y transiciones suaves
- Modo oscuro completo

### Sección en Landing Page

Ubicación: `src/app/page.tsx`

**Características**:
- Resumen del sistema de ranking
- 3 cards con beneficios principales
- CTA destacado para ver ranking completo
- Diseño atractivo con gradientes

## 🔒 Seguridad (Row Level Security)

### Políticas Implementadas

1. **Rankings Públicos**: Cualquiera puede leer `farmer_rankings`
2. **Contribuciones Propias**: Los agricultores solo pueden crear sus contribuciones
3. **Contribuciones Verificadas**: Público puede ver solo las verificadas
4. **Contribuciones Pendientes**: Solo el dueño ve sus contribuciones no verificadas

## 📊 Métricas y Estadísticas

El sistema calcula automáticamente:

- Total de agricultores
- Total de contribuciones
- Puntos promedio
- Distribución por nivel
- Contribuciones por tipo
- Tendencias temporales

## 🔄 Flujo de Trabajo

```
1. Agricultor crea contribución
   ↓
2. Contribución se guarda como "no verificada"
   ↓
3. Administrador revisa y verifica
   ↓
4. Trigger actualiza automáticamente:
   - Puntos totales
   - Contador de contribuciones
   - Nivel del agricultor
   - Estadísticas por tipo
   ↓
5. Ranking se actualiza en tiempo real
   ↓
6. Agricultor ve su nuevo nivel y puntos
```

## 🎯 Casos de Uso

### 1. Licitaciones Gubernamentales
El gobierno puede consultar el ranking para priorizar agricultores comprometidos en programas de apoyo.

### 2. Contratos Privados
Empresas agrícolas pueden identificar productores confiables y colaborativos.

### 3. Investigación
Investigadores pueden acceder a agricultores con datos valiosos verificados.

### 4. Gamificación
Motivar a los agricultores a compartir información mediante reconocimiento y beneficios.

## 📈 Futuras Mejoras

- [ ] Sistema de recompensas monetarias
- [ ] Integración con plataforma de licitaciones gubernamentales
- [ ] Notificaciones push para cambios de nivel
- [ ] Comparación entre agricultores (benchmarking)
- [ ] Badges NFT en blockchain
- [ ] Sistema de referidos
- [ ] Certificados digitales descargables
- [ ] API pública para terceros
- [ ] Dashboard de analíticas avanzadas
- [ ] Sistema de reputación basado en verificación comunitaria

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage (para avatars)
- **Hosting**: Vercel (recomendado)

## 📞 Soporte

Para problemas o preguntas sobre el sistema de ranking, consulta:
- Documentación de la base de datos: `database/farmer-ranking-schema.sql`
- Tipos TypeScript: `src/types/farmer-ranking.ts`
- Componentes de UI: `src/app/rankings/page.tsx`
- API Endpoints: `src/app/api/rankings/` y `src/app/api/contributions/`

---

**Desarrollado para BloomWatch - NASA Space Apps Challenge 2025** 🚀
