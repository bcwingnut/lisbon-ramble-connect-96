-- Add sample destination activities for popular travel destinations
-- These don't require user accounts and will populate the activities map

INSERT INTO public.destination_activities (destination, activity_name, activity_type, description, rating, coordinates) VALUES
  -- New York activities
  ('New York', 'Statue of Liberty Tour', 'sightseeing', 'Take a ferry to Liberty Island and climb the famous statue', 4.6, POINT(-74.0445, 40.6892)),
  ('New York', 'Central Park Bike Ride', 'outdoor', 'Rent a bike and explore the beautiful Central Park trails', 4.4, POINT(-73.9654, 40.7829)),
  ('New York', 'Broadway Show', 'entertainment', 'Watch a world-class musical or play in Times Square', 4.8, POINT(-73.9857, 40.7590)),
  ('New York', 'High Line Walk', 'outdoor', 'Stroll along the elevated park built on former railway tracks', 4.7, POINT(-74.0048, 40.7480)),
  
  -- Rome activities
  ('Rome', 'Vatican Museums Tour', 'culture', 'Explore the Sistine Chapel and Vatican art collections', 4.7, POINT(12.4536, 41.9065)),
  ('Rome', 'Roman Forum Walk', 'sightseeing', 'Walk through ancient Roman ruins and learn about history', 4.5, POINT(12.4853, 41.8925)),
  ('Rome', 'Gelato Tasting', 'food', 'Try authentic Italian gelato from local shops', 4.9, POINT(12.4823, 41.8986)),
  ('Rome', 'Trevi Fountain Visit', 'sightseeing', 'Make a wish at the famous baroque fountain', 4.3, POINT(12.4835, 41.9009)),
  
  -- Tokyo activities
  ('Tokyo', 'Meiji Shrine Visit', 'culture', 'Experience tranquil shrine in the heart of bustling Tokyo', 4.5, POINT(139.6993, 35.6762)),
  ('Tokyo', 'Sushi Making Class', 'food', 'Learn to make authentic sushi from expert chefs', 4.8, POINT(139.7673, 35.6785)),
  ('Tokyo', 'Robot Restaurant Show', 'entertainment', 'Unique Japanese entertainment with robots and lights', 4.2, POINT(139.7043, 35.6938)),
  ('Tokyo', 'Tsukiji Fish Market', 'food', 'Early morning tuna auction and fresh sashimi breakfast', 4.7, POINT(139.7670, 35.6652)),
  
  -- Sydney activities
  ('Sydney', 'Harbour Bridge Climb', 'adventure', 'Climb the iconic Sydney Harbour Bridge for stunning views', 4.9, POINT(151.2108, -33.8523)),
  ('Sydney', 'Bondi Beach Surfing', 'outdoor', 'Learn to surf at one of Australia''s most famous beaches', 4.6, POINT(151.2743, -33.8906)),
  ('Sydney', 'Blue Mountains Day Trip', 'nature', 'Explore scenic mountains, waterfalls and wildlife', 4.7, POINT(150.3117, -33.7122)),
  ('Sydney', 'Opera House Tour', 'culture', 'Inside tour of the iconic Sydney Opera House', 4.4, POINT(151.2153, -33.8568)),
  
  -- Barcelona activities
  ('Barcelona', 'Park Güell Tour', 'sightseeing', 'Visit Gaudí''s colorful mosaic park with city views', 4.4, POINT(2.1527, 41.4145)),
  ('Barcelona', 'Flamenco Show', 'entertainment', 'Experience passionate Spanish flamenco dancing', 4.6, POINT(2.1734, 41.3851)),
  ('Barcelona', 'Tapas Walking Tour', 'food', 'Sample traditional Spanish tapas and local wines', 4.7, POINT(2.1766, 41.3888)),
  ('Barcelona', 'La Sagrada Familia', 'sightseeing', 'Tour Gaudí''s masterpiece basilica still under construction', 4.8, POINT(2.1734, 41.4036)),
  
  -- London activities
  ('London', 'Thames River Cruise', 'sightseeing', 'See London landmarks from the water including Big Ben', 4.3, POINT(-0.1276, 51.5074)),
  ('London', 'British Museum Visit', 'culture', 'Explore world-famous artifacts and ancient treasures', 4.6, POINT(-0.1278, 51.5194)),
  ('London', 'Afternoon Tea Experience', 'food', 'Traditional British afternoon tea with scones and sandwiches', 4.5, POINT(-0.1419, 51.5014)),
  ('London', 'Tower of London Tour', 'history', 'See the Crown Jewels and learn about royal history', 4.7, POINT(-0.0759, 51.5081)),
  
  -- Dubai activities
  ('Dubai', 'Desert Safari', 'adventure', 'Dune bashing, camel rides and traditional Bedouin dinner', 4.7, POINT(55.4209, 25.0657)),
  ('Dubai', 'Dubai Fountain Show', 'entertainment', 'Musical water fountain show at the base of Burj Khalifa', 4.8, POINT(55.2708, 25.1972)),
  ('Dubai', 'Gold Souk Shopping', 'shopping', 'Browse traditional gold jewelry market in old Dubai', 4.2, POINT(55.2708, 25.2697)),
  ('Dubai', 'Burj Khalifa Observation', 'sightseeing', 'Visit the world''s tallest building observation deck', 4.6, POINT(55.2744, 25.1972)),
  
  -- Paris activities
  ('Paris', 'Louvre Museum Tour', 'culture', 'See the Mona Lisa and other masterpieces', 4.6, POINT(2.3376, 48.8606)),
  ('Paris', 'Seine River Dinner Cruise', 'dining', 'Romantic dinner cruise past illuminated landmarks', 4.7, POINT(2.3522, 48.8566)),
  ('Paris', 'Montmartre Art Walk', 'culture', 'Explore artist quarter and see street performers', 4.5, POINT(2.3412, 48.8867)),
  ('Paris', 'Eiffel Tower Visit', 'sightseeing', 'Ascend the iconic iron tower for panoramic city views', 4.5, POINT(2.2945, 48.8584)),
  
  -- San Francisco activities
  ('San Francisco', 'Alcatraz Island Tour', 'sightseeing', 'Visit the famous former federal prison island', 4.8, POINT(-122.4230, 37.8267)),
  ('San Francisco', 'Wine Tasting in Napa', 'food', 'Day trip to world-renowned Napa Valley wineries', 4.9, POINT(-122.2869, 38.2975)),
  ('San Francisco', 'Cable Car Ride', 'transport', 'Historic cable car journey through steep city streets', 4.3, POINT(-122.4194, 37.7749)),
  ('San Francisco', 'Golden Gate Bridge Walk', 'outdoor', 'Walk or bike across the famous red suspension bridge', 4.7, POINT(-122.4783, 37.8199)),
  
  -- Berlin activities
  ('Berlin', 'Brandenburg Gate Walk', 'sightseeing', 'Visit the symbol of German reunification', 4.4, POINT(13.3777, 52.5163)),
  ('Berlin', 'Berlin Wall Memorial', 'history', 'Learn about Cold War history at preserved wall sections', 4.5, POINT(13.3904, 52.5355)),
  ('Berlin', 'Beer Garden Experience', 'food', 'Traditional German beer and pretzels in local beer garden', 4.6, POINT(13.4050, 52.5200)),
  ('Berlin', 'Museum Island Tour', 'culture', 'Explore world-class museums on historic island', 4.7, POINT(13.3971, 52.5211)),
  
  -- Lisbon activities
  ('Lisbon', 'Tram 28 Ride', 'transport', 'Historic tram tour through Lisbon''s neighborhoods', 4.4, POINT(-9.1393, 38.7223)),
  ('Lisbon', 'Belém Tower Visit', 'history', 'Explore the iconic 16th century fortress tower', 4.3, POINT(-9.2160, 38.6916)),
  ('Lisbon', 'Pastéis de Nata Tasting', 'food', 'Try authentic Portuguese custard tarts at local bakeries', 4.8, POINT(-9.2034, 38.6977)),
  ('Lisbon', 'Fado Music Evening', 'entertainment', 'Experience traditional Portuguese folk music', 4.7, POINT(-9.1427, 38.7139)),
  ('Lisbon', 'Sintra Day Trip', 'nature', 'Visit fairy-tale palaces and gardens in nearby Sintra', 4.9, POINT(-9.3907, 38.8029));