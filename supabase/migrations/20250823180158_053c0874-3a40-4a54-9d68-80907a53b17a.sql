-- Update message visibility to allow all authenticated users to view all messages
-- This creates a public chat functionality

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Secure message access - users own messages only" ON public.messages;

-- Create a policy that allows all authenticated users to view all messages
CREATE POLICY "All authenticated users can view messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);