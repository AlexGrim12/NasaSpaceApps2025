# Ejemplos de Uso de la API - Sistema de Ranking

Este documento contiene ejemplos prácticos de cómo interactuar con la API del sistema de ranking de BloomWatch.

## 📋 Tabla de Contenidos

1. [Obtener Top Rankings](#1-obtener-top-rankings)
2. [Obtener Ranking de un Agricultor](#2-obtener-ranking-de-un-agricultor)
3. [Crear una Contribución](#3-crear-una-contribución)
4. [Obtener Contribuciones](#4-obtener-contribuciones)
5. [Ejemplos con cURL](#5-ejemplos-con-curl)
6. [Ejemplos con JavaScript/TypeScript](#6-ejemplos-con-javascripttypescript)

---

## 1. Obtener Top Rankings

### Endpoint
```
GET /api/rankings
```

### Parámetros Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| limit | number | No | Número máximo de resultados (default: 100) |
| level | string | No | Filtrar por nivel específico |

### Ejemplos

#### Obtener Top 10
```bash
GET /api/rankings?limit=10
```

#### Obtener solo "Gran Maestro"
```bash
GET /api/rankings?level=Gran%20Maestro
```

#### Respuesta de Éxito (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "farmer_id": "123e4567-e89b-12d3-a456-426614174000",
      "farmer_name": "Juan Pérez López",
      "total_points": 5200,
      "level": "Gran Maestro",
      "contributions_count": 104,
      "drought_reports": 25,
      "pest_reports": 30,
      "sustainable_practices": 20,
      "crop_data_shared": 20,
      "weather_data_shared": 9,
      "badges": [
        "first_contribution",
        "drought_expert",
        "pest_hunter",
        "eco_warrior",
        "data_champion"
      ],
      "avatar_url": "https://...",
      "location": "Jalisco, México",
      "rank_position": 1,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2025-10-04T15:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 2. Obtener Ranking de un Agricultor

### Endpoint
```
GET /api/rankings/[farmer_id]
```

### Ejemplo
```bash
GET /api/rankings/123e4567-e89b-12d3-a456-426614174000
```

### Respuesta de Éxito (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "farmer_id": "123e4567-e89b-12d3-a456-426614174000",
    "farmer_name": "Juan Pérez López",
    "total_points": 5200,
    "level": "Gran Maestro",
    "rank_position": 1,
    // ... resto de campos
  }
}
```

### Respuesta de Error (404)
```json
{
  "error": "Agricultor no encontrado"
}
```

---

## 3. Crear una Contribución

### Endpoint
```
POST /api/contributions
```

### Headers Requeridos
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

### Body

```json
{
  "type": "drought_report",
  "description": "Sequía severa detectada en la zona norte de Jalisco. Precipitaciones 40% por debajo del promedio histórico.",
  "metadata": {
    "location": {
      "state": "Jalisco",
      "municipality": "Tepatitlán",
      "coordinates": {
        "lat": 20.8167,
        "lng": -102.7667
      }
    },
    "severity": "high",
    "affected_hectares": 150,
    "crop_type": "maíz",
    "start_date": "2025-09-15"
  }
}
```

### Tipos de Contribución Válidos

| Tipo | Puntos | Descripción |
|------|--------|-------------|
| `drought_report` | 50 | Reporte de sequía |
| `pest_report` | 40 | Reporte de plaga |
| `sustainable_practice` | 60 | Práctica sostenible |
| `crop_data` | 30 | Datos de cultivo |
| `weather_data` | 20 | Datos climáticos |

### Respuesta de Éxito (200)
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e45b-67c8-a901-234567890abc",
    "farmer_id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "drought_report",
    "points_earned": 50,
    "description": "Sequía severa detectada...",
    "verified": false,
    "metadata": { /* ... */ },
    "created_at": "2025-10-04T10:00:00.000Z"
  },
  "message": "Contribución creada exitosamente. Está pendiente de verificación."
}
```

### Respuestas de Error

#### 401 - No Autorizado
```json
{
  "error": "No autorizado. Debes iniciar sesión."
}
```

#### 400 - Tipo Inválido
```json
{
  "error": "Tipo de contribución inválido"
}
```

#### 400 - Descripción Corta
```json
{
  "error": "La descripción es requerida y debe tener al menos 10 caracteres"
}
```

---

## 4. Obtener Contribuciones

### Endpoint
```
GET /api/contributions
```

### Parámetros Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| farmerId | string (UUID) | No | ID del agricultor |
| type | string | No | Tipo de contribución |
| verified | boolean | No | Solo verificadas (true/false) |

### Ejemplos

#### Todas las contribuciones verificadas
```bash
GET /api/contributions?verified=true
```

#### Contribuciones de un agricultor
```bash
GET /api/contributions?farmerId=123e4567-e89b-12d3-a456-426614174000
```

#### Reportes de sequías verificados
```bash
GET /api/contributions?type=drought_report&verified=true
```

### Respuesta de Éxito (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "789e0123-e45b-67c8-a901-234567890abc",
      "farmer_id": "123e4567-e89b-12d3-a456-426614174000",
      "type": "drought_report",
      "points_earned": 50,
      "description": "Sequía severa detectada...",
      "verified": true,
      "metadata": {
        "location": { /* ... */ },
        "severity": "high"
      },
      "created_at": "2025-10-04T10:00:00.000Z",
      "updated_at": "2025-10-04T11:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 5. Ejemplos con cURL

### Obtener Top 5 Rankings
```bash
curl -X GET "https://tu-dominio.com/api/rankings?limit=5" \
  -H "Content-Type: application/json"
```

### Crear Contribución (requiere auth)
```bash
curl -X POST "https://tu-dominio.com/api/contributions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "type": "pest_report",
    "description": "Detección de plaga de gusano cogollero en cultivo de maíz. Afectación moderada en aproximadamente 50 hectáreas.",
    "metadata": {
      "location": {
        "state": "Sinaloa",
        "municipality": "Culiacán"
      },
      "pest_type": "Spodoptera frugiperda",
      "severity": "moderate",
      "affected_hectares": 50
    }
  }'
```

### Obtener Contribuciones de un Agricultor
```bash
curl -X GET "https://tu-dominio.com/api/contributions?farmerId=123e4567-e89b-12d3-a456-426614174000&verified=true" \
  -H "Content-Type: application/json"
```

---

## 6. Ejemplos con JavaScript/TypeScript

### Fetch Rankings (Frontend)

```typescript
async function getTopFarmers(limit: number = 10) {
  try {
    const response = await fetch(`/api/rankings?limit=${limit}`)
    const result = await response.json()
    
    if (result.success) {
      console.log('Top Farmers:', result.data)
      return result.data
    } else {
      console.error('Error:', result.error)
      return []
    }
  } catch (error) {
    console.error('Network error:', error)
    return []
  }
}

// Uso
const topFarmers = await getTopFarmers(10)
```

### Crear Contribución con Supabase Auth

```typescript
import { supabase } from '@/lib/supabase'

async function createContribution(
  type: string,
  description: string,
  metadata?: Record<string, any>
) {
  try {
    // Obtener token de autenticación
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No autenticado')
    }

    const response = await fetch('/api/contributions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        type,
        description,
        metadata
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('Contribución creada:', result.data)
      return result.data
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error creating contribution:', error)
    throw error
  }
}

// Uso
const contribution = await createContribution(
  'drought_report',
  'Sequía severa en zona norte',
  {
    severity: 'high',
    location: { state: 'Jalisco' }
  }
)
```

### Hook de React para Rankings

```typescript
import { useState, useEffect } from 'react'
import type { FarmerRanking } from '@/types/farmer-ranking'

export function useRankings(limit: number = 100) {
  const [rankings, setRankings] = useState<FarmerRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRankings() {
      try {
        setLoading(true)
        const response = await fetch(`/api/rankings?limit=${limit}`)
        const result = await response.json()
        
        if (result.success) {
          setRankings(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [limit])

  return { rankings, loading, error }
}

// Uso en componente
function RankingsList() {
  const { rankings, loading, error } = useRankings(10)

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {rankings.map(farmer => (
        <li key={farmer.id}>
          {farmer.rank_position}. {farmer.farmer_name} - {farmer.total_points} pts
        </li>
      ))}
    </ul>
  )
}
```

### Componente de Formulario de Contribución

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContributionForm() {
  const [type, setType] = useState('drought_report')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage('Debes iniciar sesión')
        return
      }

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ type, description })
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage('¡Contribución enviada exitosamente!')
        setDescription('')
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Error al enviar contribución')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Tipo de Contribución</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="drought_report">Reporte de Sequía (50 pts)</option>
          <option value="pest_report">Reporte de Plaga (40 pts)</option>
          <option value="sustainable_practice">Práctica Sostenible (60 pts)</option>
          <option value="crop_data">Datos de Cultivo (30 pts)</option>
          <option value="weather_data">Datos Climáticos (20 pts)</option>
        </select>
      </div>

      <div>
        <label>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          minLength={10}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar Contribución'}
      </button>

      {message && (
        <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </form>
  )
}
```

---

## 🔐 Notas de Seguridad

1. **Autenticación**: Las rutas POST de contribuciones requieren token de Supabase válido
2. **Validación**: Todos los inputs son validados en el backend
3. **RLS**: Las políticas de Row Level Security protegen los datos sensibles
4. **Rate Limiting**: Considera implementar rate limiting en producción

## 🚀 Siguientes Pasos

- Implementa webhooks para notificaciones en tiempo real
- Agrega caché de Redis para optimizar consultas frecuentes
- Considera usar Server-Sent Events para rankings en vivo
- Implementa GraphQL para consultas más flexibles

---

**Desarrollado para BloomWatch - NASA Space Apps Challenge 2025** 🚀
