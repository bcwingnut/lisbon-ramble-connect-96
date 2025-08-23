import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface UserLocation {
  id: string;
  username: string;
  avatar_url?: string;
  location_text?: string;
  coordinates: [number, number]; // [lng, lat]
}

interface UserLocationMapProps {
  users: Array<{
    id: string;
    username: string;
    avatar_url?: string;
    location_text?: string;
    location_coordinates?: any; // PostgreSQL point type
  }>;
}

const UserLocationMap = ({ users }: UserLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🗺️ UserLocationMap useEffect - users:', users.length);
    
    // Filter users with valid locations
    const usersWithLocations: UserLocation[] = users
      .filter(user => user.location_coordinates)
      .map(user => {
        // Parse PostgreSQL point format "(x,y)" to coordinates
        let coordinates: [number, number] = [0, 0];
        if (user.location_coordinates && typeof user.location_coordinates === 'string') {
          const match = user.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
            coordinates = [parseFloat(match[1]), parseFloat(match[2])];
          }
        }
        
        return {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          location_text: user.location_text,
          coordinates
        };
      })
      .filter(user => user.coordinates[0] !== 0 && user.coordinates[1] !== 0);

    console.log('🗺️ Found users with locations:', usersWithLocations.length);

    if (usersWithLocations.length === 0) {
      setLoading(false);
      return;
    }

    if (!mapContainer.current) {
      console.log('🗺️ Map container not ready');
      setLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        console.log('🗺️ Initializing map...');
        
        // Get Mapbox token
        const { data, error } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [] }
        });

        if (error || !data?.mapboxToken) {
          console.error('🗺️ Failed to get token:', error);
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.mapboxToken;

        // Calculate center
        let center: [number, number];
        let zoom: number;
        
        if (usersWithLocations.length === 1) {
          center = usersWithLocations[0].coordinates;
          zoom = 12;
        } else {
          // Calculate bounds center
          const lngs = usersWithLocations.map(u => u.coordinates[0]);
          const lats = usersWithLocations.map(u => u.coordinates[1]);
          center = [
            (Math.min(...lngs) + Math.max(...lngs)) / 2,
            (Math.min(...lats) + Math.max(...lats)) / 2
          ];
          zoom = 8;
        }

        console.log('🗺️ Creating map at center:', center);

        // Create map
        const newMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          attributionControl: false
        });

        // Wait for map to load
        newMap.on('load', () => {
          console.log('🗺️ Map loaded, adding markers...');
          
          // Add markers
          usersWithLocations.forEach(user => {
            const el = document.createElement('div');
            el.style.cssText = `
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid #3b82f6;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            el.innerHTML = `
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
              ">
                ${user.username.substring(0, 2).toUpperCase()}
              </div>
            `;

            const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(`
                <div style="text-align: center; padding: 8px;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${user.username}</div>
                  ${user.location_text ? `<div style="font-size: 12px; color: #666;">${user.location_text}</div>` : ''}
                </div>
              `);

            new mapboxgl.Marker(el)
              .setLngLat(user.coordinates)
              .setPopup(popup)
              .addTo(newMap);
          });

          // Fit bounds if multiple users
          if (usersWithLocations.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            usersWithLocations.forEach(user => bounds.extend(user.coordinates));
            newMap.fitBounds(bounds, { padding: 20, maxZoom: 10 });
          }

          newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
          console.log('🗺️ Map setup complete');
          setLoading(false);
        });

        newMap.on('error', (e) => {
          console.error('🗺️ Map error:', e);
          setLoading(false);
        });

        map.current = newMap;

      } catch (error) {
        console.error('🗺️ Init error:', error);
        setLoading(false);
      }
    };

    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [users]);

  if (loading) {
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    );
  }

  const usersWithValidLocations = users.filter(user => {
    if (!user.location_coordinates) return false;
    if (typeof user.location_coordinates !== 'string') return false;
    const match = user.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
    return match && parseFloat(match[1]) !== 0 && parseFloat(match[2]) !== 0;
  });

  if (usersWithValidLocations.length === 0) {
    return (
      <Card className="mt-3 p-4">
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm text-muted-foreground">
            No traveler locations yet. Be the first to share where you're from!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium">🌍 Traveler Locations ({usersWithValidLocations.length})</div>
      </div>
      <div ref={mapContainer} className="h-48 w-full relative" />
    </Card>
  );
};

export default UserLocationMap;