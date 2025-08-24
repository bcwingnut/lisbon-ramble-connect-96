-- Insert sample users into auth.users (these would normally be created through signup)
-- Note: In a real application, users would sign up through the auth system
-- This is just for demo/development purposes

-- First, let's create some sample profiles with realistic data
INSERT INTO public.profiles (user_id, username, location_text, location_coordinates) VALUES
  (gen_random_uuid(), 'Sarah_Explorer', 'Times Square, New York, NY, USA', POINT(-73.9857, 40.7484)),
  (gen_random_uuid(), 'Marco_Wanderer', 'Colosseum, Rome, Italy', POINT(12.4924, 41.8902)),
  (gen_random_uuid(), 'Yuki_Traveler', 'Shibuya Crossing, Tokyo, Japan', POINT(139.7006, 35.6598)),
  (gen_random_uuid(), 'Emma_Nomad', 'Sydney Opera House, Sydney, Australia', POINT(151.2153, -33.8568)),
  (gen_random_uuid(), 'Carlos_Adventurer', 'Sagrada Familia, Barcelona, Spain', POINT(2.1734, 41.4036)),
  (gen_random_uuid(), 'Lisa_Backpacker', 'Tower Bridge, London, UK', POINT(-0.0754, 51.5055)),
  (gen_random_uuid(), 'Ahmed_Voyager', 'Burj Khalifa, Dubai, UAE', POINT(55.2744, 25.1972)),
  (gen_random_uuid(), 'Nina_Globetrotter', 'Eiffel Tower, Paris, France', POINT(2.2945, 48.8584)),
  (gen_random_uuid(), 'Tom_Roamer', 'Golden Gate Bridge, San Francisco, CA, USA', POINT(-122.4783, 37.8199)),
  (gen_random_uuid(), 'Sophia_Jetset', 'Brandenburg Gate, Berlin, Germany', POINT(13.3777, 52.5163));

-- Get the user IDs we just created for activities
WITH sample_users AS (
  SELECT user_id, username, location_text FROM public.profiles 
  WHERE username IN ('Sarah_Explorer', 'Marco_Wanderer', 'Yuki_Traveler', 'Emma_Nomad', 'Carlos_Adventurer', 'Lisa_Backpacker', 'Ahmed_Voyager', 'Nina_Globetrotter', 'Tom_Roamer', 'Sophia_Jetset')
)

-- Insert user activities
INSERT INTO public.user_activities (user_id, activity_type, activity_description, location_text, location_coordinates)
SELECT 
  user_id,
  activity_type,
  activity_description,
  location_text,
  coordinates
FROM sample_users
CROSS JOIN LATERAL (
  VALUES 
    ('sightseeing', 'Visiting iconic landmarks and taking photos', location_text, 
     CASE username 
       WHEN 'Sarah_Explorer' THEN POINT(-73.9857, 40.7484)
       WHEN 'Marco_Wanderer' THEN POINT(12.4924, 41.8902)
       WHEN 'Yuki_Traveler' THEN POINT(139.7006, 35.6598)
       WHEN 'Emma_Nomad' THEN POINT(151.2153, -33.8568)
       WHEN 'Carlos_Adventurer' THEN POINT(2.1734, 41.4036)
       WHEN 'Lisa_Backpacker' THEN POINT(-0.0754, 51.5055)
       WHEN 'Ahmed_Voyager' THEN POINT(55.2744, 25.1972)
       WHEN 'Nina_Globetrotter' THEN POINT(2.2945, 48.8584)
       WHEN 'Tom_Roamer' THEN POINT(-122.4783, 37.8199)
       WHEN 'Sophia_Jetset' THEN POINT(13.3777, 52.5163)
     END),
    ('food', 'Exploring local cuisine and street food', 
     CASE username
       WHEN 'Sarah_Explorer' THEN 'Little Italy, New York'
       WHEN 'Marco_Wanderer' THEN 'Trastevere, Rome'
       WHEN 'Yuki_Traveler' THEN 'Tsukiji Market, Tokyo'
       WHEN 'Emma_Nomad' THEN 'Circular Quay, Sydney'
       WHEN 'Carlos_Adventurer' THEN 'La Boqueria Market, Barcelona'
       WHEN 'Lisa_Backpacker' THEN 'Borough Market, London'
       WHEN 'Ahmed_Voyager' THEN 'Dubai Mall Food Court'
       WHEN 'Nina_Globetrotter' THEN 'Le Marais, Paris'
       WHEN 'Tom_Roamer' THEN 'Fishermans Wharf, San Francisco'
       WHEN 'Sophia_Jetset' THEN 'Hackescher Markt, Berlin'
     END,
     CASE username 
       WHEN 'Sarah_Explorer' THEN POINT(-73.9951, 40.7209)
       WHEN 'Marco_Wanderer' THEN POINT(12.4696, 41.8899)
       WHEN 'Yuki_Traveler' THEN POINT(139.7670, 35.6652)
       WHEN 'Emma_Nomad' THEN POINT(151.2108, -33.8599)
       WHEN 'Carlos_Adventurer' THEN POINT(2.1716, 41.3817)
       WHEN 'Lisa_Backpacker' THEN POINT(-0.0903, 51.5045)
       WHEN 'Ahmed_Voyager' THEN POINT(55.2796, 25.1975)
       WHEN 'Nina_Globetrotter' THEN POINT(2.3522, 48.8566)
       WHEN 'Tom_Roamer' THEN POINT(-122.4105, 37.8080)
       WHEN 'Sophia_Jetset' THEN POINT(13.4025, 52.5234)
     END)
) AS activities(activity_type, activity_description, location_text, coordinates);

-- Add some destination activities for popular locations
INSERT INTO public.destination_activities (destination, activity_name, activity_type, description, rating, coordinates) VALUES
  ('New York', 'Statue of Liberty Tour', 'sightseeing', 'Take a ferry to Liberty Island and climb the famous statue', 4.6, POINT(-74.0445, 40.6892)),
  ('New York', 'Central Park Bike Ride', 'outdoor', 'Rent a bike and explore the beautiful Central Park trails', 4.4, POINT(-73.9654, 40.7829)),
  ('New York', 'Broadway Show', 'entertainment', 'Watch a world-class musical or play in Times Square', 4.8, POINT(-73.9857, 40.7590)),
  
  ('Rome', 'Vatican Museums Tour', 'culture', 'Explore the Sistine Chapel and Vatican art collections', 4.7, POINT(12.4536, 41.9065)),
  ('Rome', 'Roman Forum Walk', 'sightseeing', 'Walk through ancient Roman ruins and learn about history', 4.5, POINT(12.4853, 41.8925)),
  ('Rome', 'Gelato Tasting', 'food', 'Try authentic Italian gelato from local shops', 4.9, POINT(12.4823, 41.8986)),
  
  ('Tokyo', 'Meiji Shrine Visit', 'culture', 'Experience tranquil shrine in the heart of bustling Tokyo', 4.5, POINT(139.6993, 35.6762)),
  ('Tokyo', 'Sushi Making Class', 'food', 'Learn to make authentic sushi from expert chefs', 4.8, POINT(139.7673, 35.6785)),
  ('Tokyo', 'Robot Restaurant Show', 'entertainment', 'Unique Japanese entertainment with robots and lights', 4.2, POINT(139.7043, 35.6938)),
  
  ('Sydney', 'Harbour Bridge Climb', 'adventure', 'Climb the iconic Sydney Harbour Bridge for stunning views', 4.9, POINT(151.2108, -33.8523)),
  ('Sydney', 'Bondi Beach Surfing', 'outdoor', 'Learn to surf at one of Australias most famous beaches', 4.6, POINT(151.2743, -33.8906)),
  ('Sydney', 'Blue Mountains Day Trip', 'nature', 'Explore scenic mountains, waterfalls and wildlife', 4.7, POINT(150.3117, -33.7122)),
  
  ('Barcelona', 'Park Güell Tour', 'sightseeing', 'Visit Gaudís colorful mosaic park with city views', 4.4, POINT(2.1527, 41.4145)),
  ('Barcelona', 'Flamenco Show', 'entertainment', 'Experience passionate Spanish flamenco dancing', 4.6, POINT(2.1734, 41.3851)),
  ('Barcelona', 'Tapas Walking Tour', 'food', 'Sample traditional Spanish tapas and local wines', 4.7, POINT(2.1766, 41.3888)),
  
  ('London', 'Thames River Cruise', 'sightseeing', 'See London landmarks from the water including Big Ben', 4.3, POINT(-0.1276, 51.5074)),
  ('London', 'British Museum Visit', 'culture', 'Explore world-famous artifacts and ancient treasures', 4.6, POINT(-0.1278, 51.5194)),
  ('London', 'Afternoon Tea Experience', 'food', 'Traditional British afternoon tea with scones and sandwiches', 4.5, POINT(-0.1419, 51.5014)),
  
  ('Dubai', 'Desert Safari', 'adventure', 'Dune bashing, camel rides and traditional Bedouin dinner', 4.7, POINT(55.4209, 25.0657)),
  ('Dubai', 'Dubai Fountain Show', 'entertainment', 'Musical water fountain show at the base of Burj Khalifa', 4.8, POINT(55.2708, 25.1972)),
  ('Dubai', 'Gold Souk Shopping', 'shopping', 'Browse traditional gold jewelry market in old Dubai', 4.2, POINT(55.2708, 25.2697)),
  
  ('Paris', 'Louvre Museum Tour', 'culture', 'See the Mona Lisa and other masterpieces', 4.6, POINT(2.3376, 48.8606)),
  ('Paris', 'Seine River Dinner Cruise', 'dining', 'Romantic dinner cruise past illuminated landmarks', 4.7, POINT(2.3522, 48.8566)),
  ('Paris', 'Montmartre Art Walk', 'culture', 'Explore artist quarter and see street performers', 4.5, POINT(2.3412, 48.8867)),
  
  ('San Francisco', 'Alcatraz Island Tour', 'sightseeing', 'Visit the famous former federal prison island', 4.8, POINT(-122.4230, 37.8267)),
  ('San Francisco', 'Wine Tasting in Napa', 'food', 'Day trip to world-renowned Napa Valley wineries', 4.9, POINT(-122.2869, 38.2975)),
  ('San Francisco', 'Cable Car Ride', 'transport', 'Historic cable car journey through steep city streets', 4.3, POINT(-122.4194, 37.7749)),
  
  ('Berlin', 'Brandenburg Gate Walk', 'sightseeing', 'Visit the symbol of German reunification', 4.4, POINT(13.3777, 52.5163)),
  ('Berlin', 'Berlin Wall Memorial', 'history', 'Learn about Cold War history at preserved wall sections', 4.5, POINT(13.3904, 52.5355)),
  ('Berlin', 'Beer Garden Experience', 'food', 'Traditional German beer and pretzels in local beer garden', 4.6, POINT(13.4050, 52.5200));