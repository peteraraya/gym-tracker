-- Migration: historial de peso corporal
-- Fecha: 2026-09-10
-- Descripción: Agrega la columna `weight_history` (jsonb, array de {date, weight} en kg)
-- a las tablas de perfil usadas por la app (`user_profiles` via /api/profile y `profiles`
-- via lib/supabase/service.ts).

BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS weight_history jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weight_history jsonb;

COMMIT;