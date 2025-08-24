-- Add sample user activities for existing real users
-- Get existing users (excluding AI Travel Assistant) and add activities for them

WITH existing_users AS (
  SELECT user_id, username, location_text FROM public.profiles 
  WHERE username != 'AI Travel Assistant' 
  AND user_id IS NOT NULL
  LIMIT 5
),
activity_samples AS (
  SELECT 
    user_id,
    username,
    (ARRAY['sightseeing', 'food', 'outdoor', 'culture', 'shopping'])[floor(random() * 5 + 1)] as activity_type,
    (ARRAY[
      'Exploring local museums and galleries',
      'Trying authentic street food',
      'Walking through historic neighborhoods',
      'Taking photos at scenic viewpoints',
      'Shopping at local markets',
      'Visiting famous landmarks',
      'Sampling regional specialties',
      'Attending cultural performances',
      'Hiking nearby trails',
      'Meeting fellow travelers'
    ])[floor(random() * 10 + 1)] as activity_description,
    COALESCE(location_text, 'Exploring the city') as location_text,
    -- Add some random coordinate variation around major cities
    CASE 
      WHEN location_text LIKE '%San Francisco%' THEN POINT(-122.4194 + (random() - 0.5) * 0.1, 37.7749 + (random() - 0.5) * 0.1)
      WHEN location_text LIKE '%New York%' THEN POINT(-73.9857 + (random() - 0.5) * 0.1, 40.7484 + (random() - 0.5) * 0.1)
      WHEN location_text LIKE '%London%' THEN POINT(-0.1276 + (random() - 0.5) * 0.1, 51.5074 + (random() - 0.5) * 0.1)
      WHEN location_text LIKE '%Paris%' THEN POINT(2.3522 + (random() - 0.5) * 0.1, 48.8566 + (random() - 0.5) * 0.1)
      WHEN location_text LIKE '%Tokyo%' THEN POINT(139.6917 + (random() - 0.5) * 0.1, 35.6895 + (random() - 0.5) * 0.1)
      WHEN location_text LIKE '%Lisbon%' THEN POINT(-9.1393 + (random() - 0.5) * 0.1, 38.7223 + (random() - 0.5) * 0.1)
      ELSE POINT(random() * 360 - 180, random() * 180 - 90)
    END as coordinates
  FROM existing_users
  -- Generate 2-3 activities per user
  CROSS JOIN generate_series(1, floor(random() * 2 + 2)::int)
)
INSERT INTO public.user_activities (user_id, activity_type, activity_description, location_text, location_coordinates)
SELECT user_id, activity_type, activity_description, location_text, coordinates
FROM activity_samples;