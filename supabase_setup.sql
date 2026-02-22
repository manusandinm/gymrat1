-- Script para crear las tablas base en Supabase
-- Cópialo y pégalo en el "SQL Editor" de tu proyecto de Supabase y dale a "Run"

-- 1. Crear tabla de perfiles (extendiendo la tabla de usuarios auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '😎',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Políticas de Seguridad de Nivel de Fila (RLS) para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los perfiles son visibles para todos" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Crear tabla de actividades (entrenamientos)
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sport_id TEXT NOT NULL,
  duration INTEGER NOT NULL,
  points INTEGER NOT NULL,
  details TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Las actividades son visibles para todos" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propias actividades" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar/borrar sus propias actividades" ON activities
  FOR ALL USING (auth.uid() = user_id);

-- Función (Trigger) para crear un perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), '😎');
  return new;
end;
$$;

-- Trigger que ejecuta la función despues de un INSERT en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
