-- Add linkedin_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN linkedin_url text;

-- Update the handle_new_user function to include LinkedIn URL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, linkedin_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'linkedin_url'
  );
  RETURN NEW;
END;
$function$;