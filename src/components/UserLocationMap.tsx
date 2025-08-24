import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface UserLocationMapProps {
  users: Array<{
    id: string;
    username: string;
    avatar_url?: string;
    location_text?: string;
    location_coordinates?: any;
  }>;
}

const UserLocationMap = ({ users }: UserLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('🗺️ UserLocationMap called with', users?.length || 0, 'users');
  
  // Filter users with coordinates - PostgreSQL point format is "(x,y)" 
  const usersWithCoords = users.filter(u => u.location_coordinates);
  console.log('🗺️ Users with coordinates:', usersWithCoords.length);
  
  // Parse PostgreSQL point coordinates "(lng,lat)" to [lng, lat] array
  const parsePostgresPoint = (point: any): [number, number] | null => {
    if (typeof point === 'string') {
      // Format: "(lng,lat)" 
      const matches = point.match(/\(([^,]+),([^)]+)\)/);
      if (matches) {
        return [parseFloat(matches[1]), parseFloat(matches[2])];
      }
    }
    return null;
  };

  // Get Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [] }
        });
        if (data?.mapboxToken) {
          setMapboxToken(data.mapboxToken);
        }
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
      } finally {
        setLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  // Initialize map when we have token and users
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || usersWithCoords.length === 0) {
      setLoading(false);
      return;
    }

    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Calculate bounds from user coordinates
      const bounds = new mapboxgl.LngLatBounds();
      usersWithCoords.forEach(user => {
        const coords = parsePostgresPoint(user.location_coordinates);
        if (coords) {
          bounds.extend(coords);
        }
      });

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds: bounds,
        fitBoundsOptions: { padding: 40 },
        attributionControl: false
      });

      map.current.on('load', () => {
        console.log('User location map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('User location map error:', e);
      });

      // Add user markers
      usersWithCoords.forEach((user) => {
        const coords = parsePostgresPoint(user.location_coordinates);
        if (!coords) return;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-sm">
              <div class="font-semibold">${user.username}</div>
              <div class="text-muted-foreground">${user.location_text || 'Location shared'}</div>
            </div>
          `);

        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map.current!);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
    } catch (error) {
      console.error('Map initialization error:', error);
    } finally {
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, usersWithCoords]);

  if (loading) {
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="text-sm text-muted-foreground">Loading traveler map...</div>
        </div>
      </Card>
    );
  }

  if (usersWithCoords.length === 0) {
    return (
      <Card className="mt-3 p-4">
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm text-muted-foreground">
            No travelers with shared locations yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {users?.length || 0} total users in chat
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium">
          🗺️ Fellow Travelers ({usersWithCoords.length} sharing locations)
        </div>
      </div>
      <div 
        ref={mapContainer} 
        className="h-64 w-full relative"
        style={{ minHeight: '256px' }}
      />
    </Card>
  );
};

export default UserLocationMap;