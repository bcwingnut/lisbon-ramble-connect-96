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
  console.log('🗺️ UserLocationMap rendering with', users.length, 'users');
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🗺️ useEffect triggered');
    
    // Filter users with valid locations
    const usersWithLocations: UserLocation[] = users
      .filter(user => {
        const hasCoords = user.location_coordinates && typeof user.location_coordinates === 'string';
        console.log('🗺️ User', user.username, 'has coordinates:', hasCoords);
        return hasCoords;
      })
      .map(user => {
        // Parse PostgreSQL point format "(x,y)" to coordinates
        let coordinates: [number, number] = [0, 0];
        if (user.location_coordinates && typeof user.location_coordinates === 'string') {
          const match = user.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
            coordinates = [parseFloat(match[1]), parseFloat(match[2])];
            console.log('🗺️ Parsed coordinates for', user.username, ':', coordinates);
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
      .filter(user => {
        const isValid = user.coordinates[0] !== 0 && user.coordinates[1] !== 0;
        console.log('🗺️ User', user.username, 'has valid coordinates:', isValid, user.coordinates);
        return isValid;
      });

    console.log('🗺️ Total users with valid locations:', usersWithLocations.length);

    if (usersWithLocations.length === 0) {
      console.log('🗺️ No valid users, setting loading false');
      setLoading(false);
      return;
    }

    const initMap = async () => {
      console.log('🗺️ Starting map initialization...');
      
      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mapContainer.current) {
        console.log('🗺️ Map container not available');
        setLoading(false);
        return;
      }

      try {
        console.log('🗺️ Getting Mapbox token...');
        
        // Get Mapbox token
        const { data, error } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [] }
        });

        console.log('🗺️ Token response:', { hasData: !!data, hasError: !!error, hasToken: !!data?.mapboxToken });

        if (error || !data?.mapboxToken) {
          console.error('🗺️ Failed to get token:', error);
          setLoading(false);
          return;
        }

        console.log('🗺️ Setting Mapbox access token');
        mapboxgl.accessToken = data.mapboxToken;

        // Calculate center and zoom
        let center: [number, number];
        let zoom: number;
        
        if (usersWithLocations.length === 1) {
          center = usersWithLocations[0].coordinates;
          zoom = 12;
          console.log('🗺️ Single user mode - center:', center);
        } else {
          // Calculate bounds center
          const lngs = usersWithLocations.map(u => u.coordinates[0]);
          const lats = usersWithLocations.map(u => u.coordinates[1]);
          center = [
            (Math.min(...lngs) + Math.max(...lngs)) / 2,
            (Math.min(...lats) + Math.max(...lats)) / 2
          ];
          zoom = 8;
          console.log('🗺️ Multiple users mode - center:', center);
        }

        console.log('🗺️ Creating Mapbox map instance...');
        
        // Create map
        const newMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          attributionControl: false
        });

        console.log('🗺️ Map instance created, adding event listeners');

        // Handle map load
        newMap.on('load', () => {
          console.log('🗺️ Map loaded successfully! Adding', usersWithLocations.length, 'markers');
          
          // Add markers
          let markersAdded = 0;
          usersWithLocations.forEach(user => {
            console.log('🗺️ Adding marker for:', user.username, 'at:', user.coordinates);
            
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
              
            markersAdded++;
            console.log('🗺️ Marker added successfully for', user.username, '- total markers:', markersAdded);
          });

          // Fit bounds if multiple users
          if (usersWithLocations.length > 1) {
            console.log('🗺️ Fitting bounds for multiple users');
            const bounds = new mapboxgl.LngLatBounds();
            usersWithLocations.forEach(user => bounds.extend(user.coordinates));
            newMap.fitBounds(bounds, { padding: 20, maxZoom: 10 });
          }

          // Add navigation controls
          newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
          console.log('🗺️ Map setup complete!');
          setLoading(false);
        });

        newMap.on('error', (e) => {
          console.error('🗺️ Map error:', e);
          setLoading(false);
        });

        // Store map reference
        map.current = newMap;

      } catch (error) {
        console.error('🗺️ Error in initMap:', error);
        setLoading(false);
      }
    };

    // Clean up existing map
    if (map.current) {
      console.log('🗺️ Cleaning up existing map');
      map.current.remove();
      map.current = null;
    }

    // Initialize map
    initMap();

    // Cleanup function
    return () => {
      if (map.current) {
        console.log('🗺️ Cleanup: removing map');
        map.current.remove();
        map.current = null;
      }
    };
  }, [users]);

  console.log('🗺️ Rendering - loading:', loading, 'users with locations:', users.filter(u => u.location_coordinates).length);

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