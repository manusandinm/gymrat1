-- Script para añadir campos al perfil
-- Ejecuta esto en el "SQL Editor" de Supabase

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '¡A darlo todo!',
ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 0;
