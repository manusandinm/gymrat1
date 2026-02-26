-- Add punishment column to leagues table if it does not exist
ALTER TABLE public.leagues
ADD COLUMN IF NOT EXISTS punishment TEXT;
