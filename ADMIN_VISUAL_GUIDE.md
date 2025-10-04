# 🎨 Vista Previa del Panel de Administrador

## 🖼️ Capturas de Pantalla (Mockup)

### 1. Navbar con Botón Admin

```
┌─────────────────────────────────────────────────────────────────┐
│ 🌱 BloomWatch     🏆 Ranking  🛡️ Admin  Dashboard  Contribuir  ☀️│
└─────────────────────────────────────────────────────────────────┘
                                  ↑
                            Solo visible
                           para admins
```

---

### 2. Panel Principal - Vista Completa

```
┌──────────────────────────────────────────────────────────────────┐
│  🛡️ Panel de Administrador                                      │
│  Verificación de contribuciones de agricultores                  │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Pendientes  │ │ Verificadas │ │   Total     │               │
│  │     15      │ │     142     │ │     157     │               │
│  │     ⏳      │ │      ✅     │ │     📈      │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar por nombre, email o descripción...                ││
│  │                                                              ││
│  │  [Todas] [Pendientes] [Verificadas]                         ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

### 3. Lista de Contribuciones

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Reporte de Sequía] ⏳ Pendiente              +50 pts         │ │
│ │                                                                 │ │
│ │ Sequía severa detectada en zona norte durante última semana    │ │
│ │                                                                 │ │
│ │ 👤 Juan Pérez  📍 Sinaloa  📅 4 Oct 2025                      │ │
│ │                                                                 │ │
│ │                  [👁️ Ver Detalles] [✅ Aprobar] [❌ Rechazar] │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Práctica Sostenible] ✅ Verificada            +100 pts        │ │
│ │                                                                 │ │
│ │ Implementación de riego por goteo en 5 hectáreas               │ │
│ │                                                                 │ │
│ │ 👤 María García  📍 Jalisco  📅 3 Oct 2025                    │ │
│ │                                                                 │ │
│ │                  [👁️ Ver Detalles] [🔄 Revocar Verificación]  │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Reporte de Plaga] ⏳ Pendiente                +75 pts         │ │
│ │                                                                 │ │
│ │ Detección de gusano cogollero en cultivo de maíz               │ │
│ │                                                                 │ │
│ │ 👤 Carlos López  📍 Michoacán  📅 2 Oct 2025                  │ │
│ │                                                                 │ │
│ │                  [👁️ Ver Detalles] [✅ Aprobar] [❌ Rechazar] │ │
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

### 4. Modal de Detalles

```
┌─────────────────────────────────────────────────────────────────┐
│  Detalles de Contribución                                    ❌  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tipo                                                            │
│  Reporte de Sequía                                              │
│                                                                  │
│  Agricultor                                                      │
│  Juan Pérez                                                      │
│  juan.perez@email.com                                           │
│                                                                  │
│  Descripción                                                     │
│  Sequía severa detectada en zona norte durante la última        │
│  semana. Afecta aproximadamente 10 hectáreas de cultivo de      │
│  maíz. Se requiere implementar sistema de riego de emergencia.  │
│                                                                  │
│  Puntos                                                          │
│  50 puntos                                                       │
│                                                                  │
│  Estado                                                          │
│  ⏳ Pendiente                                                    │
│                                                                  │
│  Fecha de Creación                                              │
│  4 de octubre de 2025, 10:30 AM                                 │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   ✅ Aprobar        │  │   ❌ Rechazar       │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Estados de Contribución

```
┌──────────────────────────────────────────┐
│  PENDIENTE                               │
│  ⏳ Esperando verificación               │
│  Color: Naranja                          │
│  Acciones: Aprobar / Rechazar            │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  VERIFICADA                              │
│  ✅ Contribución aprobada                │
│  Color: Verde                            │
│  Acciones: Revocar Verificación          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  RECHAZADA                               │
│  ❌ No verificada (sin puntos)           │
│  Color: Rojo                             │
│  Acciones: Aprobar                       │
└──────────────────────────────────────────┘
```

---

### 6. Tipos de Contribución con Colores

```
┌────────────────────────────────────────┐
│ 🌊 Reporte de Sequía                   │
│ Color: Rojo (bg-red-500/10)            │
│ Puntos: +50                            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🐛 Reporte de Plaga                    │
│ Color: Naranja (bg-orange-500/10)      │
│ Puntos: +75                            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🌱 Práctica Sostenible                 │
│ Color: Verde (bg-green-500/10)         │
│ Puntos: +100                           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 📊 Datos de Cultivo                    │
│ Color: Azul (bg-blue-500/10)           │
│ Puntos: +30                            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ☁️ Datos Meteorológicos                │
│ Color: Púrpura (bg-purple-500/10)      │
│ Puntos: +40                            │
└────────────────────────────────────────┘
```

---

### 7. Búsqueda y Filtros

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 juan                                                     │
│                                                              │
│  Resultados: 3 contribuciones encontradas                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Filtros activos:                                            │
│  • Estado: Pendientes (15)                                  │
│  • Búsqueda: "juan"                                         │
│                                                              │
│  [Limpiar filtros]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Estadísticas en Tiempo Real

```
┌────────────────────────────────────────────────────────┐
│  📊 Estadísticas del Panel                             │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Hoy:                                                   │
│  • 12 contribuciones verificadas ✅                     │
│  • 3 contribuciones rechazadas ❌                       │
│  • 5 contribuciones pendientes ⏳                       │
│                                                         │
│  Esta Semana:                                           │
│  • 87 contribuciones verificadas                        │
│  • 15 contribuciones rechazadas                         │
│  • 1,250 puntos otorgados                              │
│                                                         │
│  Agricultores Activos:                                  │
│  • 45 agricultores con contribuciones                   │
│  • 12 agricultores subieron de nivel                    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

### 9. Responsive Design

#### Desktop (>1024px)

```
┌──────────────────────────────────────────────────────────┐
│  [Estadísticas en 3 columnas]                            │
│  [Búsqueda completa con filtros inline]                  │
│  [Lista de contribuciones en grid]                       │
│  [Acciones visibles en cada card]                        │
└──────────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1024px)

```
┌────────────────────────────────────────┐
│  [Estadísticas en 2 columnas]          │
│  [Búsqueda completa]                   │
│  [Filtros en nueva línea]              │
│  [Lista de contribuciones apiladas]    │
│  [Acciones debajo de cada card]        │
└────────────────────────────────────────┘
```

#### Mobile (<768px)

```
┌─────────────────────────┐
│  [Stats vertical]       │
│  [Búsqueda full-width]  │
│  [Filtros apilados]     │
│  [Lista vertical]       │
│  [Acciones apiladas]    │
└─────────────────────────┘
```

---

### 10. Dark Mode

```
┌──────────────────────────────────────────────────┐
│  LIGHT MODE                                      │
│  • Fondo: bg-gradient-to-br from-green-50        │
│  • Cards: bg-white                               │
│  • Texto: text-gray-900                          │
│  • Bordes: border-gray-300                       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  DARK MODE                                       │
│  • Fondo: bg-gradient-to-br from-gray-900        │
│  • Cards: bg-gray-800                            │
│  • Texto: text-white                             │
│  • Bordes: border-gray-600                       │
└──────────────────────────────────────────────────┘
```

---

### 11. Loading States

```
┌────────────────────────────────────┐
│                                    │
│         ⚪ Cargando...            │
│    (spinner animado)               │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Procesando verificación...        │
│  ⏳ Por favor espera               │
└────────────────────────────────────┘
```

---

### 12. Estado Vacío

```
┌────────────────────────────────────────────┐
│                                            │
│              ⚠️                            │
│                                            │
│     No se encontraron contribuciones       │
│                                            │
│  Intenta cambiar los filtros o búsqueda   │
│                                            │
└────────────────────────────────────────────┘
```

---

### 13. Confirmaciones y Feedback

```
┌────────────────────────────────────┐
│  ✅ ¡Éxito!                        │
│  Contribución verificada            │
│  correctamente                      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  ❌ Error                          │
│  No se pudo verificar la            │
│  contribución. Intenta de nuevo.   │
└────────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

### Principales

- **Verde Primary:** `#10b981` (green-500)
- **Naranja Warning:** `#f59e0b` (orange-500)
- **Rojo Danger:** `#ef4444` (red-500)
- **Azul Info:** `#3b82f6` (blue-500)
- **Púrpura:** `#a855f7` (purple-500)

### Estados

- **Pendiente:** Naranja (#f59e0b)
- **Verificada:** Verde (#10b981)
- **Rechazada:** Rojo (#ef4444)

### Backgrounds

- **Light:** White (#ffffff)
- **Dark:** Gray-800 (#1f2937)
- **Gradient Light:** green-50 to blue-50
- **Gradient Dark:** gray-900 to gray-800

---

## 📱 Interacciones

### Hover Effects

```
Botón Normal:     bg-green-500
Botón Hover:      bg-green-600
Transición:       transition-colors (150ms)
```

### Click Effects

```
Estado Normal:    shadow-sm
Estado Hover:     shadow-md
Estado Active:    scale-95
```

### Focus States

```
Input Focus:      ring-2 ring-green-500
Button Focus:     outline outline-2 outline-green-500
```

---

## ✨ Animaciones

### Loading Spinner

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Slide Up

```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 🎯 Flujo Visual

```
Usuario entra → Verifica rol → Muestra panel
                     ↓
          Carga contribuciones
                     ↓
     ┌──────────────┼──────────────┐
     ↓              ↓              ↓
Pendientes    Verificadas      Todas
     ↓              ↓              ↓
Filtrar/Buscar ← Usuario selecciona
     ↓
Ver detalles (modal)
     ↓
┌────┼────┐
↓         ↓
Aprobar  Rechazar
↓         ↓
Actualizar ranking
↓
Registrar auditoría
↓
Mostrar éxito
```

---

## 🖥️ Componentes UI

### Card de Contribución

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Contenido */}
</div>
```

### Badge de Estado

```tsx
<span className="px-3 py-1 rounded-full text-sm font-medium">
  {/* Estado */}
</span>
```

### Botón de Acción

```tsx
<button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
  {/* Acción */}
</button>
```

---

## 📐 Layout Grid

```
┌─────────────────────────────────────────────────────┐
│  Container max-w-7xl mx-auto                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  Header (h1, description)                      ││
│  └────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │Stat1│ │Stat2│ │Stat3│  (grid-cols-3)           │
│  └─────┘ └─────┘ └─────┘                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  Search + Filters (flex justify-between)       ││
│  └────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  Contribution Card 1                           ││
│  └────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────┐│
│  │  Contribution Card 2                           ││
│  └────────────────────────────────────────────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎉 Estado Final

El panel de administrador tiene:

- ✅ UI moderna y profesional
- ✅ Responsive en todos los dispositivos
- ✅ Dark mode completo
- ✅ Animaciones suaves
- ✅ Feedback visual claro
- ✅ Accesibilidad considerada
- ✅ Loading states apropiados
- ✅ Estados vacíos informativos

---

**Nota:** Esta es una guía visual mockup. El panel real se renderiza con React y Tailwind CSS con todas estas características implementadas.
