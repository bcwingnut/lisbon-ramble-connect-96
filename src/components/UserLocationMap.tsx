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

  console.log('UserLocationMap received users:', users);

  // Filter users with valid coordinates and parse PostgreSQL point format
  const usersWithLocations: UserLocation[] = users
    .filter(user => {
      console.log('Checking user for location:', user.username, 'coordinates:', user.location_coordinates);
      return user.location_coordinates;
    })
    .map(user => {
      // Parse PostgreSQL point format "(x,y)" to coordinates
      let coordinates: [number, number] = [0, 0];
      if (user.location_coordinates && typeof user.location_coordinates === 'string') {
        const match = user.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
          coordinates = [parseFloat(match[1]), parseFloat(match[2])];
          console.log('Parsed coordinates for', user.username, ':', coordinates);
        } else {
          console.warn('Could not parse coordinates for', user.username, ':', user.location_coordinates);
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
      console.log('User', user.username, 'has valid coordinates:', hasValidCoords, user.coordinates);
      return hasValidCoords;
    });

  console.log('Filtered users with valid locations:', usersWithLocations);

  useEffect(() => {
    const initMap = async () => {
      console.log('Initializing user location map');
      
      // Wait for container to be available
      if (!mapContainer.current) {
        console.log('Map container not ready, retrying...');
        setTimeout(initMap, 100);
        return;
      }
      
      if (usersWithLocations.length === 0) {
        console.log('No users with locations found, showing empty state');
        setLoading(false);
        return;
      }

      try {
        console.log('Getting Mapbox token...');
        // Get Mapbox token from our edge function
        const { data, error: tokenError } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [] }
        });

        if (tokenError) {
          console.error('Error getting Mapbox token:', tokenError);
          setLoading(false);
          return;
        }

        if (!data?.mapboxToken) {
          console.error('No Mapbox token available');
          setLoading(false);
          return;
        }

        console.log('Got Mapbox token, creating map with', usersWithLocations.length, 'users');
        mapboxgl.accessToken = data.mapboxToken;

        // Calculate bounds for all user locations
        const bounds = new mapboxgl.LngLatBounds();
        usersWithLocations.forEach(user => {
          console.log('Adding user to bounds:', user.username, user.coordinates);
          bounds.extend(user.coordinates);
        });

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          bounds: bounds,
          fitBoundsOptions: { padding: 20, maxZoom: 10 },
          attributionControl: false
        });

        map.current.on('load', () => {
          console.log('User location map loaded successfully');
          setLoading(false);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setLoading(false);
        });

        // Add user markers
        usersWithLocations.forEach(user => {
          console.log('Adding marker for user:', user.username, 'at coordinates:', user.coordinates);
          
          // Create custom marker with user avatar
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
            .addTo(map.current!);
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      } catch (error) {
        console.error('Error initializing user location map:', error);
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
  }, [usersWithLocations.length, JSON.stringify(usersWithLocations)]);

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
      <div ref={mapContainer} className="h-48 w-full relative" />
    </Card>
  );
};

export default UserLocationMap;