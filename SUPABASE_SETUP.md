# Configuración de Supabase para BloomWatch

## Pasos para configurar Supabase

1. **Crear proyecto en Supabase**

   - Ve a https://supabase.com
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto
   - Espera a que se inicialice (puede tomar unos minutos)

2. **Obtener las credenciales**

   - Ve a Settings > API
   - Copia la URL del proyecto
   - Copia la clave pública anon

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` con tus credenciales:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```

4. **Crear la tabla de perfiles**

   Ve a la sección SQL Editor en Supabase y ejecuta:

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

   -- Enable RLS (Row Level Security)
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies for security
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Function to handle user registration
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, name, role)
     VALUES (
       new.id,
       new.email,
       COALESCE(new.raw_user_meta_data->>'name', ''),
       COALESCE(new.raw_user_meta_data->>'role', 'agricultor')
     );
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger to automatically create profile on signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

5. **Configurar políticas de autenticación** (Opcional)

   Ve a Authentication > Settings y ajusta:

   - Enable email confirmations (si quieres)
   - Configure redirect URLs si usas un dominio personalizado

## Estructura de la base de datos

### Tabla: profiles

- `id`: UUID (Primary Key, Foreign Key a auth.users)
- `email`: TEXT (Email del usuario)
- `name`: TEXT (Nombre completo)
- `role`: TEXT (agricultor | investigador)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Próximas tablas a implementar

### Tabla: farms (para agricultores)

```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location POINT,
  area_hectares DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: satellite_data (para datos NASA)

```sql
CREATE TABLE satellite_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  satellite_source TEXT, -- 'MODIS', 'Landsat', 'VIIRS'
  image_date DATE,
  ndvi_value DECIMAL,
  bloom_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Notas importantes

- Las políticas RLS están configuradas para que cada usuario solo pueda ver/editar su propio perfil
- La función `handle_new_user()` crea automáticamente un perfil cuando un usuario se registra
- El rol por defecto es 'agricultor' si no se especifica otro
- Todos los timestamps usan la zona horaria del servidor
