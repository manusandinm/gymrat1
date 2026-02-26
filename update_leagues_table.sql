-- Script consolidado para actualizar la tabla de ligas con todos los campos nuevos
-- Copia y ejecuta este archivo en el "SQL Editor" de Supabase

ALTER TABLE public.leagues
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS punishment TEXT;
