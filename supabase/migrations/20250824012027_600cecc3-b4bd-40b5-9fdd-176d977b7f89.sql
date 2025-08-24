-- Fix function search path security issue
-- Set proper search path for the existing functions to improve security

ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.handle_trip_creation() SET search_path = 'public';