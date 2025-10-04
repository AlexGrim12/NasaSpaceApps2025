# ⚡ Guía de Inicio Rápido - Sistema de Ranking

¿Quieres tener el sistema funcionando en **menos de 30 minutos**? Sigue esta guía paso a paso.

## 🎯 Prerequisitos (5 minutos)

Asegúrate de tener:

- ✅ Node.js 18+ instalado
- ✅ Cuenta de Supabase (gratis)
- ✅ Git instalado

## 🚀 Paso 1: Configurar Supabase (10 minutos)

### 1.1 Crear Proyecto

```bash
1. Ve a https://supabase.com
2. Click en "New Project"
3. Nombra tu proyecto: "bloomwatch"
4. Elige una región cercana
5. Crea una contraseña fuerte
6. Click en "Create new project"
7. Espera 2 minutos mientras se crea
```

### 1.2 Configurar Base de Datos

```bash
1. En tu proyecto, ve a "SQL Editor"
2. Click en "+ New query"
3. Copia TODO el contenido de: database/farmer-ranking-schema.sql
4. Pega en el editor
5. Click en "Run" (o Ctrl+Enter)
6. Verifica que dice "Success. No rows returned"
```

### 1.3 Obtener Credenciales

```bash
1. Ve a "Settings" > "API"
2. Copia "Project URL"
3. Copia "anon public" key
4. Guárdalas en un lugar seguro
```

## 💻 Paso 2: Configurar Proyecto (5 minutos)

### 2.1 Clonar y Configurar

```bash
# Clonar repositorio
git clone <tu-repo-url>
cd NASA

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env.local
```

### 2.2 Configurar Variables de Entorno

```bash
# Editar .env.local con tus credenciales
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 🎮 Paso 3: Iniciar Proyecto (2 minutos)

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abre tu navegador en:
http://localhost:3000
```

## ✨ Paso 4: Probar el Sistema (8 minutos)

### 4.1 Ver Ranking Vacío

```bash
1. Ve a: http://localhost:3000/rankings
2. Deberías ver "No hay agricultores en este nivel"
```

### 4.2 Crear Tu Primer Usuario

```bash
1. Ve a: http://localhost:3000/auth/register
2. Selecciona: "Agricultor"
3. Llena el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: mínimo 6 caracteres
4. Click en "Crear cuenta como Agricultor"
5. Deberías ver el dashboard de agricultor
```

### 4.3 Crear Primera Contribución

**Opción A: Desde Supabase (Más Rápido)**

```sql
1. Ve a Supabase Dashboard
2. Abre "Table Editor"
3. Selecciona tabla "contributions"
4. Click en "Insert" > "Insert row"
5. Llena los campos:
   - farmer_id: [Copia tu ID desde auth.users]
   - type: drought_report
   - points_earned: 50
   - description: "Mi primera contribución de prueba"
   - verified: true (marca el checkbox)
6. Click "Save"
```

**Opción B: Usando SQL**

```sql
-- Ve a SQL Editor y ejecuta:
-- Primero obtén tu farmer_id:
SELECT id, email FROM auth.users;

-- Luego crea la contribución (reemplaza el UUID):
INSERT INTO contributions (farmer_id, type, points_earned, description, verified)
VALUES ('tu-uuid-aqui', 'drought_report', 50, 'Primera prueba', true);
```

### 4.4 Ver Tu Ranking

```bash
1. Ve a: http://localhost:3000/rankings
2. ¡Deberías verte en el puesto #1! 🥇
3. Con 50 puntos
4. Nivel: Aprendiz
```

## 🎉 ¡Listo!

Tu sistema está funcionando. Ahora puedes:

### Crear Más Contribuciones

```sql
-- Agregar más contribuciones para subir de nivel:
SELECT insert_sample_contributions('tu-uuid', 'drought_report', 10);
SELECT insert_sample_contributions('tu-uuid', 'pest_report', 10);
SELECT insert_sample_contributions('tu-uuid', 'sustainable_practice', 5);

-- Luego recarga /rankings para ver tu progreso
```

### Explorar la Documentación

- 📖 [Sistema Completo](./FARMER_RANKING_SYSTEM.md)
- 💻 [Ejemplos de API](./API_EXAMPLES.md)
- 🗺️ [Guía Visual](./VISUAL_GUIDE.md)

### Probar Features

- [ ] Filtrar por nivel en `/rankings`
- [ ] Cambiar tema oscuro/claro
- [ ] Ver en mobile (responsive)
- [ ] Probar API endpoints

## 🐛 ¿Problemas?

### Error: "Cannot connect to Supabase"

```bash
✅ Verifica que copiaste correctamente las credenciales
✅ Revisa que .env.local existe y tiene las variables
✅ Reinicia el servidor: Ctrl+C y luego npm run dev
```

### Error: "Table does not exist"

```bash
✅ Asegúrate de haber ejecutado farmer-ranking-schema.sql
✅ Ve a Supabase > Table Editor y verifica las tablas
✅ Ejecuta el script completo de nuevo si es necesario
```

### No aparezco en el ranking

```bash
✅ Verifica que verified = true en la contribución
✅ Ve a Table Editor > contributions y verifica tus registros
✅ Ve a Table Editor > farmer_rankings y verifica tu entrada
✅ Los triggers deberían actualizar automáticamente
```

### Error al crear contribución

```bash
✅ Verifica que estás autenticado
✅ Usa el UUID correcto de tu usuario
✅ Verifica que el tipo es válido (drought_report, pest_report, etc.)
```

## 📱 Próximos Pasos

### Para Desarrollo

1. ✅ Agregar más usuarios de prueba
2. ✅ Crear contribuciones variadas
3. ✅ Probar diferentes niveles
4. ✅ Personalizar colores/estilos
5. ✅ Agregar tu logo

### Para Producción

1. ✅ Seguir [checklist completo](./IMPLEMENTATION_CHECKLIST.md)
2. ✅ Hacer pruebas exhaustivas
3. ✅ Deploy a Vercel
4. ✅ Configurar dominio

## 🎯 Tips Rápidos

### Crear Múltiples Contribuciones Rápido

```sql
-- Ejecuta en SQL Editor para crear 25 contribuciones:
DO $$
DECLARE
    i INTEGER;
    user_id UUID := 'tu-uuid-aqui';
BEGIN
    FOR i IN 1..25 LOOP
        INSERT INTO contributions (farmer_id, type, points_earned, description, verified)
        VALUES (user_id, 'drought_report', 50, 'Contribución ' || i, true);
    END LOOP;
END $$;
```

### Ver Estadísticas Rápidas

```sql
-- Total de puntos y contribuciones:
SELECT
    farmer_name,
    total_points,
    level,
    contributions_count
FROM farmer_rankings
ORDER BY total_points DESC;
```

### Reset para Empezar de Nuevo

```sql
-- CUIDADO: Esto borra TODO
TRUNCATE TABLE contributions CASCADE;
TRUNCATE TABLE farmer_rankings CASCADE;
```

## 🌟 Funcionalidades Destacadas

### Landing Page

- 🏠 Sección de ranking integrada
- 🎯 Explicación clara de beneficios
- 🚀 CTA para unirse

### Dashboard de Ranking

- 🏆 Top 100 agricultores
- 🥇 Medallas para top 3
- 📊 Estadísticas en tiempo real
- 🎨 Filtros por nivel
- 🌙 Modo oscuro

### Sistema de Puntos

- 🌵 Sequía: 50 pts
- 🐛 Plaga: 40 pts
- ♻️ Sostenible: 60 pts
- 📊 Cultivo: 30 pts
- 🌦️ Clima: 20 pts

### 6 Niveles

- 🌱 Aprendiz (0-99)
- 🌿 Cultivador (100-499)
- 👨‍🌾 Experimentado (500-1,499)
- 🎓 Maestro (1,500-4,999)
- ⭐ Gran Maestro (5,000-9,999)
- 🏆 Leyenda (10,000+)

## 🎓 Recursos

### Documentación

- [README Principal](./README.md)
- [Resumen de Implementación](./IMPLEMENTATION_SUMMARY.md)
- [Sistema Completo](./FARMER_RANKING_SYSTEM.md)

### Código

- API: `src/app/api/rankings/` y `src/app/api/contributions/`
- UI: `src/app/rankings/page.tsx`
- Tipos: `src/types/farmer-ranking.ts`
- SQL: `database/farmer-ranking-schema.sql`

## 🎉 ¡Felicidades!

Has configurado exitosamente el **Sistema de Ranking de Agricultores** para BloomWatch.

**Tiempo total**: ~30 minutos
**Dificultad**: Fácil
**Resultado**: Sistema completo y funcional

---

**¿Preguntas? Consulta la [documentación completa](./FARMER_RANKING_SYSTEM.md)**

_Desarrollado para BloomWatch - NASA Space Apps Challenge 2025_ 🚀🌽
