# 🌽 BloomWatch - NASA Space Apps Challenge 2025

> **Monitoreo inteligente de la floración del maíz en México usando datos satelitales de la NASA**

BloomWatch es una aplicación web moderna desarrollada para el NASA Space Apps Challenge 2025, diseñada para revolucionar el monitoreo de eventos de floración del maíz en México utilizando datos de observación terrestre de la NASA.

## 🚀 Características Principales

- **🌱 Dashboard Dual**: Interfaces especializadas para Agricultores e Investigadores
- **🛰️ Datos NASA**: Integración con imágenes satelitales MODIS, Landsat y VIIRS
- **🌙 Modo Oscuro/Claro**: Interfaz adaptable a las preferencias del usuario
- **📊 Visualización de Datos**: Gráficos interactivos y mapas de cultivos
- **🔒 Autenticación Segura**: Sistema de roles con Supabase
- **📱 Diseño Responsivo**: Optimizado para todos los dispositivos
- **🏆 Sistema de Ranking**: Reconocimiento para agricultores contribuyentes

## 🎯 Objetivos del Proyecto

### Para Agricultores 🌾

- Monitoreo en tiempo real de cultivos de maíz
- Predicciones de floración basadas en IA
- Optimización de riego y nutrientes
- Alertas de eventos importantes
- **Sistema de puntos y niveles por contribuciones**
- **Acceso a mejores contratos y licitaciones gubernamentales**

### Para Investigadores 🔬

- Acceso a datos históricos de floración
- Análisis fenológicos detallados
- Herramientas de investigación científica
- Contribución al conocimiento agrícola

### Sistema de Ranking 🏆

BloomWatch incluye un sistema completo de ranking que recompensa a los agricultores por compartir información valiosa:

- **Puntos por Contribuciones**: Sequías (50 pts), Plagas (40 pts), Prácticas Sostenibles (60 pts), Datos de Cultivos (30 pts), Datos Climáticos (20 pts)
- **6 Niveles de Progresión**: Desde Aprendiz hasta Leyenda del Campo
- **Sistema de Insignias**: 7 badges especiales por logros
- **Dashboard Público**: Ranking visible en `/rankings` sin necesidad de autenticación
- **Beneficios Reales**: Mejores contratos y prioridad en licitaciones gubernamentales

📖 **[Ver Documentación Completa del Sistema de Ranking](./FARMER_RANKING_SYSTEM.md)**

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v3
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Temas**: Next Themes

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Configuración Local

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` con tus credenciales de Supabase:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configurar base de datos en Supabase**

   **Paso 1: Configurar tablas básicas**

   Ejecuta el siguiente SQL en tu proyecto de Supabase:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     email TEXT NOT NULL,
     name TEXT NOT NULL,
     role TEXT CHECK (role IN ('agricultor', 'investigador')) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   ```

   **Paso 2: Configurar Sistema de Ranking (Opcional pero Recomendado)**

   Para habilitar el sistema completo de ranking de agricultores, ejecuta el script:

   ```bash
   # En el SQL Editor de Supabase, ejecuta el contenido de:
   database/farmer-ranking-schema.sql
   ```

   Este script crea:

   - Tablas: `farmer_rankings` y `contributions`
   - Funciones: `calculate_farmer_level`, `update_farmer_ranking`, `get_top_farmers`
   - Triggers automáticos para actualización de puntos
   - Políticas de seguridad RLS
   - Índices para optimización

4. **Iniciar servidor de desarrollo**

   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**

   - Landing page: `http://localhost:3000`
   - Ranking público: `http://localhost:3000/rankings`
   - Login: `http://localhost:3000/auth/login`
   - Registro: `http://localhost:3000/auth/register`

   La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura del Proyecto

```
NASA/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page con sección de ranking
│   │   ├── rankings/             # Dashboard público de rankings
│   │   │   └── page.tsx
│   │   ├── auth/                 # Autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/            # Dashboards privados
│   │   │   ├── farmer/
│   │   │   └── researcher/
│   │   └── api/                  # API Routes
│   │       ├── rankings/         # Endpoints de ranking
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── contributions/    # Endpoints de contribuciones
│   │           └── route.ts
│   ├── components/               # Componentes reutilizables
│   ├── contexts/                 # Contextos de React
│   ├── lib/                      # Utilidades y configuración
│   └── types/                    # TypeScript types
│       └── farmer-ranking.ts     # Tipos del sistema de ranking
├── database/                     # Scripts SQL
│   ├── farmer-ranking-schema.sql # Schema completo del ranking
│   └── sample-data.sql           # Datos de ejemplo
├── FARMER_RANKING_SYSTEM.md      # Documentación del sistema
├── API_EXAMPLES.md               # Ejemplos de uso de API
├── VISUAL_GUIDE.md               # Guía visual del sistema
└── README.md                     # Este archivo
```

## 🎮 Uso del Sistema

### Para Agricultores

1. **Registro**: Ve a `/auth/register?role=agricultor`
2. **Dashboard**: Accede a tu panel de control
3. **Contribuir**: Reporta sequías, plagas, prácticas sostenibles
4. **Ganar Puntos**: Las contribuciones verificadas otorgan puntos
5. **Subir de Nivel**: Acumula puntos para mejorar tu ranking
6. **Beneficios**: Accede a mejores contratos gubernamentales

### Para Visitantes/Gobierno/Empresas

1. **Ver Rankings**: Visita `/rankings` (sin necesidad de cuenta)
2. **Filtrar**: Busca por nivel de agricultor
3. **Analizar**: Ve estadísticas detalladas de cada agricultor
4. **Contactar**: Identifica agricultores para contratos/licitaciones

### Para Investigadores

1. **Registro**: Ve a `/auth/register?role=investigador`
2. **Dashboard**: Accede a herramientas de análisis
3. **Datos**: Consulta información compartida por agricultores
4. **Investigación**: Realiza estudios fenológicos

## 📚 Documentación Adicional

- 📖 **[Sistema de Ranking Completo](./FARMER_RANKING_SYSTEM.md)** - Guía detallada del sistema de puntos, niveles y badges
- 💻 **[Ejemplos de API](./API_EXAMPLES.md)** - Ejemplos de código para usar la API
- 🗺️ **[Guía Visual](./VISUAL_GUIDE.md)** - Diagramas y flujos del sistema
- 🗄️ **[Schema SQL](./database/farmer-ranking-schema.sql)** - Script de base de datos
- 📝 **[Datos de Ejemplo](./database/sample-data.sql)** - Script para poblar datos de prueba

## 🔌 API Endpoints

### Rankings

```bash
# Obtener top 100 agricultores
GET /api/rankings

# Obtener top 10
GET /api/rankings?limit=10

# Filtrar por nivel
GET /api/rankings?level=Gran%20Maestro

# Obtener ranking de un agricultor específico
GET /api/rankings/[farmer_id]
```

### Contribuciones

```bash
# Listar contribuciones
GET /api/contributions

# Filtrar por agricultor
GET /api/contributions?farmerId=[uuid]

# Solo verificadas
GET /api/contributions?verified=true

# Crear contribución (requiere autenticación)
POST /api/contributions
Content-Type: application/json
Authorization: Bearer [token]

{
  "type": "drought_report",
  "description": "Descripción detallada...",
  "metadata": { "location": "...", "severity": "high" }
}
```

## 🏆 Sistema de Puntos

| Contribución  | Puntos | Descripción                         |
| ------------- | ------ | ----------------------------------- |
| 🌵 Sequía     | 50 pts | Reporte de condiciones de sequía    |
| 🐛 Plaga      | 40 pts | Detección y reporte de plagas       |
| ♻️ Sostenible | 60 pts | Prácticas de agricultura sostenible |
| 📊 Cultivo    | 30 pts | Datos de producción y cosecha       |
| 🌦️ Clima      | 20 pts | Información meteorológica local     |

## 📈 Niveles de Progresión

| Nivel            | Puntos      | Color   | Beneficios              |
| ---------------- | ----------- | ------- | ----------------------- |
| 🌱 Aprendiz      | 0-99        | Gris    | Acceso básico           |
| 🌿 Cultivador    | 100-499     | Verde   | Prioridad baja          |
| 👨‍🌾 Experimentado | 500-1,499   | Azul    | Prioridad media         |
| 🎓 Maestro       | 1,500-4,999 | Morado  | Prioridad alta          |
| ⭐ Gran Maestro  | 5,000-9,999 | Naranja | Programas especiales    |
| 🏆 Leyenda       | 10,000+     | Dorado  | Reconocimiento nacional |

## 🛡️ Seguridad

- **Autenticación**: Supabase Auth con JWT
- **RLS (Row Level Security)**: Políticas a nivel de base de datos
- **API Protection**: Validación de inputs y rate limiting
- **HTTPS**: Comunicación encriptada en producción

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
   ```
3. Deploy automático en cada push a `main`

### Otras Plataformas

- **Netlify**: Compatible con Next.js
- **AWS Amplify**: Soporte completo
- **Railway**: Deploy con un click
- **DigitalOcean App Platform**: Configuración simple

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📱 Características Responsive

- **Mobile First**: Diseñado primero para móviles
- **Tablet Optimized**: Layout adaptado para tablets
- **Desktop Enhanced**: Experiencia completa en desktop
- **PWA Ready**: Preparado para Progressive Web App

## 🌐 Internacionalización

Actualmente en **Español (México)**, preparado para:

- 🇺🇸 English
- 🇫🇷 Français
- 🇵🇹 Português

## 🤝 Contribuir

¿Quieres contribuir al proyecto? ¡Genial!

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto fue desarrollado para el NASA Space Apps Challenge 2025.

## 🏆 Equipo

- **Frontend Development**: Alejandro Grimaldo
- **Investigación**: Leonardo Grimaldo
- **Base de Datos**: Ruy Cabello Cuahutle
- **Proyectos Open Source**: Roni Hernández
- **Análisis Satelital**: Ceibelen
- **Desarrollo Backend**: Carlos Nolasco

---

**¡Únete a la revolución agrícola con BloomWatch! 🌽✨**
.
