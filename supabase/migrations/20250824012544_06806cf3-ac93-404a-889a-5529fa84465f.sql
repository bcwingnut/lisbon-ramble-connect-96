-- Remove FK from profiles.user_id to auth.users and seed fake profiles with locations
BEGIN;

-- 1) Drop the foreign key constraint (if it exists)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 2) Seed fake profiles with locations (idempotent by username)
WITH samples (username, location_text, lon, lat) AS (
  VALUES
    ('alice', 'Lisbon, Portugal', -9.1393, 38.7223),
    ('bob', 'Paris, France', 2.3522, 48.8566),
    ('charlie', 'Tokyo, Japan', 139.6917, 35.6895),
    ('diana', 'San Francisco, USA', -122.4194, 37.7749),
    ('edgar', 'New York, USA', -74.0060, 40.7128),
    ('fiona', 'London, UK', -0.1276, 51.5074),
    ('george', 'Berlin, Germany', 13.4050, 52.5200),
    ('hannah', 'Sydney, Australia', 151.2093, -33.8688)
)
INSERT INTO public.profiles (id, user_id, username, location_text, location_coordinates, avatar_url)
SELECT gen_random_uuid(), gen_random_uuid(), s.username, s.location_text, point(s.lon, s.lat), NULL
FROM samples s
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.username = s.username
);

COMMIT;