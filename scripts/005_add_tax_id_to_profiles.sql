-- Add tax_id field to profiles table for user settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;