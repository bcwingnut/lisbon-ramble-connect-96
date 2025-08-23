-- Fix the foreign key relationship between messages and profiles tables
-- Add foreign key constraint to link messages.user_id to profiles.user_id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;