-- Script para crear las tablas restantes en Supabase (Rutinas y Ligas) de forma SEGURA evitando duplicados
-- Ejecuta este código en el "SQL Editor" de tu proyecto de Supabase.

-- 1. Crear tabla de rutinas guardadas (Solo si no existe)
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden ver sus propias rutinas" ON routines FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden insertar sus propias rutinas" ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden actualizar sus propias rutinas" ON routines FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden borrar sus propias rutinas" ON routines FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Crear tabla de ligas (Solo si no existe)
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  punishment TEXT,
  end_date DATE NOT NULL,
  prize TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Las ligas son visibles para todos" ON leagues FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Cualquiera logueado puede crear ligas" ON leagues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Crear tabla de miembros de ligas (Solo si no existe)
CREATE TABLE IF NOT EXISTS league_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(league_id, user_id)
);

ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Los miembros de liga son visibles para todos" ON league_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden unirse a ligas" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Los usuarios pueden actualizar sus propios puntos en la liga" ON league_members FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Insertar una "Liga de Prueba" inicial
INSERT INTO leagues (id, name, code, end_date, prize) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Liga de Prueba', 'PRUEBA26', '2026-12-31', 'Honor y Gloria')
ON CONFLICT DO NOTHING;
