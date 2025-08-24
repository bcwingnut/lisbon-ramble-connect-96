-- Seed user activities for fake users (idempotent)
BEGIN;

WITH activities AS (
  SELECT * FROM (
    VALUES
      -- Alice (Lisbon)
      ('alice','sightseeing','Sunset at Miradouro da Senhora do Monte'),
      ('alice','food','Pastéis de Belém tasting tour'),
      -- Bob (Paris)
      ('bob','museum','Morning at the Louvre – Denon Wing'),
      ('bob','food','Picnic at Champ de Mars with baguettes & cheese'),
      -- Charlie (Tokyo)
      ('charlie','nightlife','Golden Gai bar hopping in Shinjuku'),
      ('charlie','culture','Asakusa Senso-ji early visit and street snacks'),
      -- Diana (San Francisco)
      ('diana','outdoors','Bike across the Golden Gate Bridge to Sausalito'),
      ('diana','food','Ferry Building farmers market breakfast'),
      -- Edgar (New York)
      ('edgar','park','Stroll through Central Park to Bethesda Terrace'),
      ('edgar','museum','Modern art afternoon at MoMA'),
      -- Fiona (London)
      ('fiona','market','Explore Borough Market food stalls'),
      ('fiona','sightseeing','Sunset ride on the London Eye'),
      -- George (Berlin)
      ('george','history','Berlin Wall Memorial and Bernauer Strasse'),
      ('george','nightlife','Techno night at a Kreuzberg club'),
      -- Hannah (Sydney)
      ('hannah','beach','Morning surf at Bondi Beach coastal walk'),
      ('hannah','sightseeing','Sydney Opera House guided tour')
  ) AS t(username, activity_type, activity_description)
)
INSERT INTO public.user_activities (id, user_id, activity_type, activity_description, location_text, location_coordinates)
SELECT 
  gen_random_uuid(),
  p.user_id,
  a.activity_type,
  a.activity_description,
  p.location_text,
  p.location_coordinates
FROM public.profiles p
JOIN activities a ON a.username = p.username
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_activities ua
  WHERE ua.user_id = p.user_id AND ua.activity_description = a.activity_description
);

COMMIT;