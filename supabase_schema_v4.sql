-- Script para añadir funcionalidad de Ligas Públicas y Privadas
-- Ejecuta esto en el "SQL Editor" de Supabase

ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
