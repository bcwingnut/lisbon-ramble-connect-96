-- Check current policies and fix the security issue properly
-- First, let's see what policies currently exist and then fix them

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;

-- Create a secure policy with a unique name
CREATE POLICY "Secure message access - users own messages only" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = user_id);