-- Fix security issue: Restrict message access to only the message author
-- This replaces the overly permissive "Messages are viewable by everyone" policy

-- Drop the existing policy that allows everyone to read all messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;

-- Create a secure policy that only allows users to view their own messages
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optional: If this is meant to be a group chat, you could also add policies like:
-- CREATE POLICY "Users can view messages in their groups" 
-- ON public.messages 
-- FOR SELECT 
-- USING (user_id IN (SELECT user_id FROM group_members WHERE group_id = messages.group_id AND user_id = auth.uid()));

-- For now, implementing the most secure approach where users can only see their own messages