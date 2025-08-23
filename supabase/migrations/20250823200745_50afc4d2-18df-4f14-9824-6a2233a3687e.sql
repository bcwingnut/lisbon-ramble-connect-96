-- Create AI bot profile if it doesn't exist
-- This user_id will be used for all AI messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ) THEN
    INSERT INTO public.profiles (user_id, username, avatar_url)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'AI Travel Assistant',
      NULL
    );
  END IF;
END $$;
