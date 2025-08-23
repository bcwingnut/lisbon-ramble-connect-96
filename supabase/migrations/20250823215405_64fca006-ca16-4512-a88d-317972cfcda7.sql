-- Add location fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN location_text text,
ADD COLUMN location_coordinates point;

-- Add index for efficient location queries
CREATE INDEX idx_profiles_location_coordinates ON public.profiles USING gist(location_coordinates);