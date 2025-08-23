-- Create a system profile for AI responses
INSERT INTO public.profiles (id, user_id, username, created_at, updated_at) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'AI Travel Assistant',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;