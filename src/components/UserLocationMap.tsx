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
  console.log('🗺️ UserLocationMap RENDER - users count:', users.length);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple user filtering without complex logic
  const validUsers = users.filter(user => {
    if (!user.location_coordinates || typeof user.location_coordinates !== 'string') {
      return false;
    }
    const match = user.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
    if (!match) return false;
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return lng !== 0 && lat !== 0;
  });

  console.log('🗺️ Valid users with locations:', validUsers.length);

  useEffect(() => {
    console.log('🗺️ useEffect triggered, valid users:', validUsers.length);
    
    if (validUsers.length === 0) {
      console.log('🗺️ No valid users, setting loading false');
      setLoading(false);
      return;
    }

    // Simple timeout to test if this runs
    const timer = setTimeout(() => {
      console.log('🗺️ Timer executed, setting loading false');
      setLoading(false);
    }, 1000);

    return () => {
      console.log('🗺️ Cleanup effect');
      clearTimeout(timer);
    };
  }, [validUsers.length]);

  console.log('🗺️ Rendering component, loading:', loading, 'validUsers:', validUsers.length);

  if (loading) {
    console.log('🗺️ Rendering loading state');
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    );
  }

  if (validUsers.length === 0) {
    console.log('🗺️ Rendering empty state');
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

  console.log('🗺️ Rendering map container');
  return (
    <Card className="mt-3 overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium">🌍 Traveler Locations ({validUsers.length})</div>
      </div>
      <div ref={mapContainer} className="h-48 w-full relative" />
    </Card>
  );
};

export default UserLocationMap;