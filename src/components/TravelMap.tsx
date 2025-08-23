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
    const foundLocations = new Set<string>();
    
    // Extract specific place names (proper nouns and landmarks)
    const specificPlaces = [
      // Cities and countries
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b(?=\s*(?:,\s*(?:UK|USA|France|Germany|Italy|Spain|Japan|China|Brazil|Australia|Canada|India|Mexico|Thailand|Netherlands|Switzerland|Austria|Belgium|Norway|Sweden|Denmark|Finland|Portugal|Greece|Turkey|Egypt|Morocco|South Africa|Argentina|Chile|Peru|Colombia|Vietnam|Malaysia|Singapore|Philippines|Indonesia|South Korea|New Zealand|Ireland|Scotland|Wales|England|Poland|Czech Republic|Hungary|Romania|Bulgaria|Croatia|Slovenia|Slovakia|Lithuania|Latvia|Estonia|Iceland|Luxembourg|Malta|Cyprus)))/gi,
      
      // Bold locations in markdown (more generic)
      /\*\*([A-Z][a-zA-Z\s'-]+(?:Museum|Gallery|Palace|Cathedral|Basilica|Temple|Mosque|Synagogue|Park|Garden|Square|Plaza|Market|Mall|Tower|Bridge|Castle|Fort|Stadium|Arena|Theater|Theatre|Opera|Library|University|Hospital|Hotel|Restaurant|Cafe|Bar|Club|Beach|Island|Mountain|Lake|River|Falls|Valley|Desert|Forest|Monument|Memorial|Cemetery|Zoo|Aquarium|Observatory|Planetarium|Station|Airport|Port|Harbor|District|Quarter|Neighborhood|City|Town|Village))\*\*/gi,
      
      // Places with specific keywords (more generic)  
      /(?:visit|explore|go to|check out|head to|stop by|see|experience|discover)\s+([A-Z][a-zA-Z\s'-]+(?:Museum|Gallery|Palace|Cathedral|Temple|Park|Square|Market|Tower|Bridge|Castle|Stadium|Theater|Library|Hotel|Restaurant|Beach|Mountain|Lake|Monument|District|City|Town))/gi,
      
      // Landmark pattern for famous places
      /\b([A-Z][a-zA-Z\s'-]*(?:Tower|Bridge|Palace|Cathedral|Museum|Gallery|Park|Square|Castle|Temple|Mosque|Basilica|Observatory|Stadium|Arena|Falls|Mountain|Lake|River|Desert|Island))\b/gi,
      
      // City names followed by attractions
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:Cathedral|Museum|Palace|Castle|Bridge|Tower|Park|Square|Market|Opera|Theater|Stadium|Airport|Station)\b/gi
    ];
    
    specificPlaces.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const location = (match[1] || match[0])?.trim();
        if (location && location.length > 3 && location.length < 50) {
          // Filter out common generic terms
          const genericTerms = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Must-sees', 'Local Experience', 'Food', 'Practical Tip', 'Best time', 'Price range', 'What', 'How to get there', 'Where', 'Tip', 'Again'];
          if (!genericTerms.some(term => location.toLowerCase().includes(term.toLowerCase()))) {
            foundLocations.add(location);
          }
        }
      }
    });

    return Array.from(foundLocations).slice(0, 6); // Limit to 6 locations for better map display
  };

  useEffect(() => {
    const locationNames = extractLocations(content);
    console.log('Extracted locations:', locationNames);
    
    if (locationNames.length === 0) return;

    setLoading(true);
    
    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    supabase.functions.invoke('geocode-locations', {
      body: { locations: locationNames }
    }).then(({ data, error }) => {
      if (error) {
        console.error('Geocoding error:', error);
        return;
      }

      if (data?.locations && data.mapboxToken && data.locations.length > 0) {
        console.log('Map data received:', data.locations);
        setLocations(data.locations);
        
        // Wait for next tick to ensure container is ready
        setTimeout(() => {
          if (mapContainer.current && data.locations.length > 0) {
            try {
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
                fitBoundsOptions: { padding: 40 },
                attributionControl: false
              });

              map.current.on('load', () => {
                console.log('Map loaded successfully');
              });

              map.current.on('error', (e) => {
                console.error('Map error:', e);
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
            } catch (error) {
              console.error('Map initialization error:', error);
            }
          }
        }, 100);
      }
    }).finally(() => {
      setLoading(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
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
      <div 
        ref={mapContainer} 
        className="h-64 w-full relative"
        style={{ minHeight: '256px' }}
      />
    </Card>
  );
};

export default TravelMap;