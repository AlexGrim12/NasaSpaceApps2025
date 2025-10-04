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

## 🎯 Objetivos del Proyecto

### Para Agricultores 🌾

- Monitoreo en tiempo real de cultivos de maíz
- Predicciones de floración basadas en IA
- Optimización de riego y nutrientes
- Alertas de eventos importantes

### Para Investigadores 🔬

- Acceso a datos históricos de floración
- Análisis fenológicos detallados
- Herramientas de investigación científica
- Contribución al conocimiento agrícola

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase
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

4. **Iniciar servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 🏆 Equipo

- **Frontend Development**: Alejandro Grimaldo
- **Investigación**: Leonardo Grimaldo
- **Base de Datos**: Ruy Cabello Cuahutle
- **Proyectos Open Source**: Roni Hernández
- **Análisis Satelital**: Ceibelen
- **Desarrollo Backend**: Carlos Nolasco

---

**¡Únete a la revolución agrícola con BloomWatch! 🌽✨**
