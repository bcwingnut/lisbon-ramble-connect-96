-- Create table for tracking user activities
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  location_text TEXT,
  location_coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user activities
CREATE POLICY "Anyone can view activities"
ON public.user_activities
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own activities"
ON public.user_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
ON public.user_activities
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON public.user_activities
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_user_activities_updated_at
BEFORE UPDATE ON public.user_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sample activities data for popular destinations
CREATE TABLE public.destination_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  coordinates POINT,
  rating NUMERIC DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for destination activities
ALTER TABLE public.destination_activities ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view destination activities
CREATE POLICY "Anyone can view destination activities"
ON public.destination_activities
FOR SELECT
USING (true);

-- Insert sample activities for major destinations
INSERT INTO public.destination_activities (destination, activity_name, activity_type, description, coordinates, rating) VALUES
('Lisbon', 'Pastéis de Belém', 'food', 'Famous pastry shop for Portuguese custard tarts', POINT(-9.203893, 38.697742), 4.7),
('Lisbon', 'Jerónimos Monastery', 'sightseeing', 'Historic monastery and UNESCO World Heritage site', POINT(-9.206173, 38.697956), 4.6),
('Lisbon', 'Fado Performance', 'entertainment', 'Traditional Portuguese music in Alfama district', POINT(-9.133072, 38.711398), 4.8),
('Paris', 'Eiffel Tower', 'sightseeing', 'Iconic iron lattice tower and symbol of Paris', POINT(2.294481, 48.858370), 4.6),
('Paris', 'Seine River Cruise', 'sightseeing', 'Scenic boat tour along the Seine River', POINT(2.349014, 48.853474), 4.4),
('Paris', 'Louvre Museum', 'culture', 'World''s largest art museum and historic monument', POINT(2.337644, 48.860611), 4.7),
('Tokyo', 'Sensoji Temple', 'culture', 'Ancient Buddhist temple in Asakusa district', POINT(139.796741, 35.714744), 4.5),
('Tokyo', 'Tsukiji Fish Market', 'food', 'Famous fish market with fresh sushi', POINT(139.770305, 35.665498), 4.3),
('Tokyo', 'Cherry Blossom Viewing', 'nature', 'Hanami in Ueno Park during spring', POINT(139.771614, 35.712285), 4.9),
('San Francisco', 'Golden Gate Bridge', 'sightseeing', 'Iconic suspension bridge and city landmark', POINT(-122.478255, 37.819929), 4.7),
('San Francisco', 'Alcatraz Island', 'history', 'Former federal prison with guided tours', POINT(-122.422999, 37.826978), 4.5),
('San Francisco', 'Fisherman''s Wharf', 'entertainment', 'Waterfront area with shops and restaurants', POINT(-122.415826, 37.808673), 4.2);