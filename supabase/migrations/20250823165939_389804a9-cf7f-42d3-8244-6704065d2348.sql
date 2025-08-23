-- Update messages table to reference profiles instead of auth.users
ALTER TABLE public.messages 
DROP CONSTRAINT messages_user_id_fkey;

-- Add foreign key to profiles table
ALTER TABLE public.messages 
ADD CONSTRAINT messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;