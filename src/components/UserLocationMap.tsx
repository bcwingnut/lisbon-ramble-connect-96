import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🗺️ UserLocationMap render - users:', users.length);

  const mapRef = useCallback((node: HTMLDivElement | null) => {
    console.log('🗺️ mapRef callback called with node:', !!node);
    if (node !== null) {
      setMapContainer(node);
    }
  }, []);

  // Memoize the filtered users calculation to avoid unnecessary re-renders
  const usersWithLocations: UserLocation[] = useMemo(() => {
    console.log('🔄 Recalculating usersWithLocations from', users.length, 'users');
    const result = users
      .filter(user => {
        const hasCoords = user.location_coordinates;
        console.log('- User', user.username, 'has coordinates:', !!hasCoords);
        return hasCoords;
      })
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
      .filter(user => {
        const hasValidCoords = user.coordinates[0] !== 0 && user.coordinates[1] !== 0;
        console.log('- User', user.username, 'has valid coordinates:', hasValidCoords, user.coordinates);
        return hasValidCoords;
      });
    
    console.log('🗺️ Final usersWithLocations:', result.length, result);
    return result;
  }, [users]);

  useEffect(() => {
    console.log('🚀 useEffect triggered - usersWithLocations:', usersWithLocations.length, 'mapContainer:', !!mapContainer);
    
    const initMap = async () => {
      console.log('🚀 initMap called');
      
      if (usersWithLocations.length === 0) {
        console.log('⚠️ No users with locations, setting loading false');
        setLoading(false);
        return;
      }

      if (!mapContainer) {
        console.log('⚠️ No map container available yet');
        return;
      }

      console.log('✅ Proceeding with map initialization');

      try {
        console.log('🔑 Getting Mapbox token...');
        // Get Mapbox token from our edge function
        const { data, error: tokenError } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [] }
        });

        console.log('🔑 Token response:', { data: !!data, error: !!tokenError, token: !!data?.mapboxToken });

        if (tokenError || !data?.mapboxToken) {
          console.error('❌ Failed to get Mapbox token:', tokenError);
          setLoading(false);
          return;
        }

        console.log('✅ Got Mapbox token, initializing map');
        mapboxgl.accessToken = data.mapboxToken;

        // Calculate center and zoom for locations
        let center: [number, number];
        let zoom: number;
        
        if (usersWithLocations.length === 1) {
          center = usersWithLocations[0].coordinates;
          zoom = 12;
          console.log('📍 Single user mode - center:', center);
        } else {
          const bounds = new mapboxgl.LngLatBounds();
          usersWithLocations.forEach(user => {
            bounds.extend(user.coordinates);
          });
          
          const boundsCenter = bounds.getCenter();
          center = [boundsCenter.lng, boundsCenter.lat];
          zoom = 8;
          console.log('📍 Multiple users mode - center:', center);
        }

        console.log('🗺️ Creating map with center:', center, 'zoom:', zoom);

        // Initialize map
        console.log('🗺️ Creating new Mapbox map instance...');
        const newMap = new mapboxgl.Map({
          container: mapContainer,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          attributionControl: false
        });

        console.log('🗺️ Map instance created, setting up event listeners');
        setMap(newMap);

        // Fit bounds for multiple locations after map loads
        newMap.on('load', () => {
          console.log('✅ Map loaded successfully');
          if (usersWithLocations.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            usersWithLocations.forEach(user => {
              bounds.extend(user.coordinates);
            });
            newMap.fitBounds(bounds, { padding: 20, maxZoom: 10 });
          }
          setLoading(false);
        });

        newMap.on('error', (e) => {
          console.error('❌ Map error:', e);
          setLoading(false);
        });

        // Add user markers
        console.log('📍 Adding', usersWithLocations.length, 'markers to map');
        usersWithLocations.forEach(user => {
          console.log('📍 Adding marker for:', user.username, 'at:', user.coordinates);
          const markerDiv = document.createElement('div');
          markerDiv.className = 'user-location-marker';
          markerDiv.style.cssText = `
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
          markerDiv.innerHTML = `
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

          new mapboxgl.Marker(markerDiv)
            .setLngLat(user.coordinates)
            .setPopup(popup)
            .addTo(newMap);
        });

        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        console.log('✅ Map initialization complete');
      } catch (error) {
        console.error('❌ Error in map initialization:', error);
        setLoading(false);
      }
    };

    // Clean up existing map
    if (map) {
      console.log('🧹 Cleaning up existing map');
      map.remove();
      setMap(null);
    }

    initMap();

    return () => {
      if (map) {
        console.log('🧹 Cleaning up map on unmount');
        map.remove();
        setMap(null);
      }
    };
  }, [usersWithLocations, mapContainer]);

  if (loading) {
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    );
  }

  if (usersWithLocations.length === 0) {
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
        <div className="text-sm font-medium">🌍 Traveler Locations ({usersWithLocations.length})</div>
      </div>
      <div ref={mapRef} className="h-48 w-full relative" />
    </Card>
  );
};

export default UserLocationMap;