-- Add sample destination activities for popular locations
-- This doesn't require user accounts and will populate the activities map

INSERT INTO public.destination_activities (destination, activity_name, activity_type, description, rating, coordinates) VALUES
  -- New York activities
  ('New York', 'Statue of Liberty Tour', 'sightseeing', 'Take a ferry to Liberty Island and climb the famous statue', 4.6, POINT(-74.0445, 40.6892)),
  ('New York', 'Central Park Bike Ride', 'outdoor', 'Rent a bike and explore the beautiful Central Park trails', 4.4, POINT(-73.9654, 40.7829)),
  ('New York', 'Broadway Show', 'entertainment', 'Watch a world-class musical or play in Times Square', 4.8, POINT(-73.9857, 40.7590)),
  ('New York', 'High Line Walk', 'outdoor', 'Stroll along the elevated park built on former railway tracks', 4.5, POINT(-74.0048, 40.7480)),
  ('New York', '9/11 Memorial Visit', 'history', 'Pay respects at the World Trade Center memorial', 4.7, POINT(-74.0134, 40.7115)),
  
  -- Rome activities
  ('Rome', 'Vatican Museums Tour', 'culture', 'Explore the Sistine Chapel and Vatican art collections', 4.7, POINT(12.4536, 41.9065)),
  ('Rome', 'Roman Forum Walk', 'sightseeing', 'Walk through ancient Roman ruins and learn about history', 4.5, POINT(12.4853, 41.8925)),
  ('Rome', 'Gelato Tasting', 'food', 'Try authentic Italian gelato from local shops', 4.9, POINT(12.4823, 41.8986)),
  ('Rome', 'Trevi Fountain Visit', 'sightseeing', 'Make a wish at the famous baroque fountain', 4.3, POINT(12.4833, 41.9009)),
  ('Rome', 'Pantheon Tour', 'history', 'Visit the best preserved Roman building', 4.6, POINT(12.4768, 41.8986)),
  
  -- Tokyo activities
  ('Tokyo', 'Meiji Shrine Visit', 'culture', 'Experience tranquil shrine in the heart of bustling Tokyo', 4.5, POINT(139.6993, 35.6762)),
  ('Tokyo', 'Sushi Making Class', 'food', 'Learn to make authentic sushi from expert chefs', 4.8, POINT(139.7673, 35.6785)),
  ('Tokyo', 'Robot Restaurant Show', 'entertainment', 'Unique Japanese entertainment with robots and lights', 4.2, POINT(139.7043, 35.6938)),
  ('Tokyo', 'Senso-ji Temple', 'culture', 'Visit Tokyo oldest Buddhist temple in Asakusa', 4.4, POINT(139.7967, 35.7148)),
  ('Tokyo', 'Harajuku Fashion Walk', 'culture', 'Explore youth culture and unique fashion in Harajuku', 4.3, POINT(139.7025, 35.6702)),
  
  -- Sydney activities
  ('Sydney', 'Harbour Bridge Climb', 'adventure', 'Climb the iconic Sydney Harbour Bridge for stunning views', 4.9, POINT(151.2108, -33.8523)),
  ('Sydney', 'Bondi Beach Surfing', 'outdoor', 'Learn to surf at one of Australias most famous beaches', 4.6, POINT(151.2743, -33.8906)),
  ('Sydney', 'Blue Mountains Day Trip', 'nature', 'Explore scenic mountains, waterfalls and wildlife', 4.7, POINT(150.3117, -33.7122)),
  ('Sydney', 'Opera House Tour', 'culture', 'Guided tour of the iconic Sydney Opera House', 4.5, POINT(151.2153, -33.8568)),
  ('Sydney', 'Darling Harbour Walk', 'outdoor', 'Waterfront precinct with shops, restaurants and attractions', 4.2, POINT(151.2017, -33.8737)),
  
  -- Barcelona activities
  ('Barcelona', 'Park Güell Tour', 'sightseeing', 'Visit Gaudís colorful mosaic park with city views', 4.4, POINT(2.1527, 41.4145)),
  ('Barcelona', 'Flamenco Show', 'entertainment', 'Experience passionate Spanish flamenco dancing', 4.6, POINT(2.1734, 41.3851)),
  ('Barcelona', 'Tapas Walking Tour', 'food', 'Sample traditional Spanish tapas and local wines', 4.7, POINT(2.1766, 41.3888)),
  ('Barcelona', 'Sagrada Familia Visit', 'sightseeing', 'Marvel at Gaudis unfinished masterpiece cathedral', 4.8, POINT(2.1734, 41.4036)),
  ('Barcelona', 'Gothic Quarter Walk', 'culture', 'Explore medieval streets and historic buildings', 4.5, POINT(2.1774, 41.3828)),
  
  -- London activities
  ('London', 'Thames River Cruise', 'sightseeing', 'See London landmarks from the water including Big Ben', 4.3, POINT(-0.1276, 51.5074)),
  ('London', 'British Museum Visit', 'culture', 'Explore world-famous artifacts and ancient treasures', 4.6, POINT(-0.1278, 51.5194)),
  ('London', 'Afternoon Tea Experience', 'food', 'Traditional British afternoon tea with scones and sandwiches', 4.5, POINT(-0.1419, 51.5014)),
  ('London', 'Tower of London Tour', 'history', 'See the Crown Jewels and learn about royal history', 4.4, POINT(-0.0759, 51.5081)),
  ('London', 'Camden Market Shopping', 'shopping', 'Browse eclectic market stalls and vintage finds', 4.2, POINT(-0.1426, 51.5412)),
  
  -- Dubai activities
  ('Dubai', 'Desert Safari', 'adventure', 'Dune bashing, camel rides and traditional Bedouin dinner', 4.7, POINT(55.4209, 25.0657)),
  ('Dubai', 'Dubai Fountain Show', 'entertainment', 'Musical water fountain show at the base of Burj Khalifa', 4.8, POINT(55.2708, 25.1972)),
  ('Dubai', 'Gold Souk Shopping', 'shopping', 'Browse traditional gold jewelry market in old Dubai', 4.2, POINT(55.2708, 25.2697)),
  ('Dubai', 'Burj Khalifa Observation', 'sightseeing', 'Visit the worlds tallest building observation deck', 4.6, POINT(55.2744, 25.1972)),
  ('Dubai', 'Dubai Mall Aquarium', 'entertainment', 'Walk through one of the worlds largest aquariums', 4.3, POINT(55.2796, 25.1975)),
  
  -- Paris activities
  ('Paris', 'Louvre Museum Tour', 'culture', 'See the Mona Lisa and other masterpieces', 4.6, POINT(2.3376, 48.8606)),
  ('Paris', 'Seine River Dinner Cruise', 'dining', 'Romantic dinner cruise past illuminated landmarks', 4.7, POINT(2.3522, 48.8566)),
  ('Paris', 'Montmartre Art Walk', 'culture', 'Explore artist quarter and see street performers', 4.5, POINT(2.3412, 48.8867)),
  ('Paris', 'Eiffel Tower Evening', 'sightseeing', 'Watch the tower sparkle with evening light show', 4.8, POINT(2.2945, 48.8584)),
  ('Paris', 'Versailles Day Trip', 'history', 'Explore the opulent palace and gardens of French kings', 4.7, POINT(2.1203, 48.8049)),
  
  -- San Francisco activities
  ('San Francisco', 'Alcatraz Island Tour', 'sightseeing', 'Visit the famous former federal prison island', 4.8, POINT(-122.4230, 37.8267)),
  ('San Francisco', 'Wine Tasting in Napa', 'food', 'Day trip to world-renowned Napa Valley wineries', 4.9, POINT(-122.2869, 38.2975)),
  ('San Francisco', 'Cable Car Ride', 'transport', 'Historic cable car journey through steep city streets', 4.3, POINT(-122.4194, 37.7749)),
  ('San Francisco', 'Golden Gate Park Bike', 'outdoor', 'Cycle through the large urban park to Ocean Beach', 4.4, POINT(-122.4530, 37.7694)),
  ('San Francisco', 'Fishermans Wharf Visit', 'sightseeing', 'See sea lions and enjoy fresh seafood at the pier', 4.2, POINT(-122.4105, 37.8080)),
  
  -- Berlin activities
  ('Berlin', 'Brandenburg Gate Walk', 'sightseeing', 'Visit the symbol of German reunification', 4.4, POINT(13.3777, 52.5163)),
  ('Berlin', 'Berlin Wall Memorial', 'history', 'Learn about Cold War history at preserved wall sections', 4.5, POINT(13.3904, 52.5355)),
  ('Berlin', 'Beer Garden Experience', 'food', 'Traditional German beer and pretzels in local beer garden', 4.6, POINT(13.4050, 52.5200)),
  ('Berlin', 'Museum Island Tour', 'culture', 'UNESCO World Heritage site with five world-renowned museums', 4.7, POINT(13.3975, 52.5211)),
  ('Berlin', 'East Side Gallery', 'art', 'Open-air gallery on remaining section of Berlin Wall', 4.3, POINT(13.4396, 52.5055)),
  
  -- Additional popular destinations
  ('Amsterdam', 'Canal Cruise', 'sightseeing', 'Scenic boat tour through historic Amsterdam canals', 4.5, POINT(4.9041, 52.3676)),
  ('Amsterdam', 'Anne Frank House', 'history', 'Visit the hiding place of the famous WWII diarist', 4.7, POINT(4.8840, 52.3750)),
  ('Amsterdam', 'Van Gogh Museum', 'art', 'Worlds largest collection of Van Gogh paintings', 4.6, POINT(4.8810, 52.3584)),
  
  ('Prague', 'Prague Castle Tour', 'history', 'Explore the largest ancient castle complex in the world', 4.6, POINT(14.4009, 50.0910)),
  ('Prague', 'Old Town Square Walk', 'sightseeing', 'See the famous Astronomical Clock and Gothic churches', 4.5, POINT(14.4212, 50.0875)),
  ('Prague', 'Czech Beer Tasting', 'food', 'Sample traditional Czech beers in historic pubs', 4.7, POINT(14.4378, 50.0755)),
  
  ('Lisbon', 'Tram 28 Ride', 'transport', 'Historic tram journey through Lisbon neighborhoods', 4.3, POINT(-9.1393, 38.7223)),
  ('Lisbon', 'Belém Tower Visit', 'history', 'UNESCO World Heritage fortified tower from 16th century', 4.4, POINT(-9.2160, 38.6916)),
  ('Lisbon', 'Fado Music Show', 'entertainment', 'Experience traditional Portuguese folk music', 4.8, POINT(-9.1429, 38.7097)),
  ('Lisbon', 'Pastéis de Nata Tasting', 'food', 'Try the famous Portuguese custard tarts', 4.9, POINT(-9.2058, 38.6978));