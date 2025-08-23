import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface Location {
  name: string;
  coordinates: [number, number]; // [lng, lat]
}

interface TravelMapProps {
  content: string;
}

const TravelMap = ({ content }: TravelMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Extract location names from content
  const extractLocations = (text: string): string[] => {
    // Look for patterns that might be locations
    const patterns = [
      /\*\*([^*]+)\*\*/g, // Bold text (markdown)
      /(?:visit|try|explore|go to|check out)\s+([A-Z][a-zA-Z\s]+?)(?:[.,!]|$)/gi,
      /([A-Z][a-zA-Z\s]+(?:Restaurant|Cafe|Hotel|Museum|Park|Beach|Market|Temple|Church|Square|Street|Avenue))/gi,
    ];
    
    const foundLocations = new Set<string>();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const location = match[1]?.trim();
        if (location && location.length > 2 && location.length < 50) {
          foundLocations.add(location);
        }
      }
    });

    return Array.from(foundLocations).slice(0, 8); // Limit to 8 locations
  };

  useEffect(() => {
    const locationNames = extractLocations(content);
    
    if (locationNames.length === 0) return;

    setLoading(true);

    supabase.functions.invoke('geocode-locations', {
      body: { locations: locationNames }
    }).then(({ data, error }) => {
      if (error) {
        console.error('Geocoding error:', error);
        return;
      }

      if (data?.locations && data.mapboxToken) {
        setLocations(data.locations);
        
        if (mapContainer.current && data.locations.length > 0) {
          mapboxgl.accessToken = data.mapboxToken;
          
          // Calculate bounds
          const bounds = new mapboxgl.LngLatBounds();
          data.locations.forEach((loc: Location) => {
            bounds.extend(loc.coordinates);
          });

          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            bounds: bounds,
            fitBoundsOptions: { padding: 40 }
          });

          // Add markers
          data.locations.forEach((location: Location) => {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setText(location.name);

            new mapboxgl.Marker({ color: '#3b82f6' })
              .setLngLat(location.coordinates)
              .setPopup(popup)
              .addTo(map.current!);
          });

          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }
      }
    }).finally(() => {
      setLoading(false);
    });

    return () => {
      map.current?.remove();
    };
  }, [content]);

  if (loading) {
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    );
  }

  if (locations.length === 0) return null;

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium">📍 Recommended Locations ({locations.length})</div>
      </div>
      <div ref={mapContainer} className="h-64 w-full" />
    </Card>
  );
};

export default TravelMap;