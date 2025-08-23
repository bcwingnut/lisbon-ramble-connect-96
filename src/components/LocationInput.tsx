import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LocationInputProps {
  currentLocation?: string;
  onLocationUpdate: (location: string | null) => void;
}

const LocationInput = ({ currentLocation, onLocationUpdate }: LocationInputProps) => {
  const [location, setLocation] = useState(currentLocation || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpdateLocation = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      let coordinates = null;
      
      if (location.trim()) {
        console.log('Geocoding location:', location.trim());
        
        // Geocode the location
        const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-locations', {
          body: { locations: [location.trim()] }
        });
        
        console.log('Geocode response:', geocodeData, geocodeError);
        
        if (geocodeError) {
          console.error('Geocoding error:', geocodeError);
        }
        
        if (geocodeData?.locations?.[0]) {
          const [lng, lat] = geocodeData.locations[0].coordinates;
          coordinates = `(${lng},${lat})`;
          console.log('Generated coordinates:', coordinates);
        } else {
          console.warn('No coordinates found for location:', location.trim());
        }
      }

      console.log('Updating profile with:', { location_text: location.trim() || null, location_coordinates: coordinates });

      // Update the user's profile
      const { error } = await supabase
        .from('profiles')
        .update({
          location_text: location.trim() || null,
          location_coordinates: coordinates
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      onLocationUpdate(location.trim() || null);
      
      // Force immediate refresh of user data
      console.log('🔄 Forcing immediate user data refresh...');
      window.location.reload(); // Temporary debugging - force full refresh to see if data is actually saved
      
      toast({
        title: "Location updated",
        description: location.trim() ? `Your location is now set to ${location}` : "Your location has been removed"
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update your location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGPSLocation = async () => {
    if (!user || !navigator.geolocation) {
      toast({
        title: "GPS not available",
        description: "Your device doesn't support GPS location.",
        variant: "destructive"
      });
      return;
    }

    setIsGettingGPS(true);

    try {
      // Check permission status first
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permissionStatus.state === 'denied') {
          toast({
            title: "Location access blocked",
            description: "Please enable location access in your browser settings and reload the page.",
            variant: "destructive"
          });
          setIsGettingGPS(false);
          return;
        }
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const coordinates = `(${longitude},${latitude})`;
      
      console.log('GPS coordinates obtained:', coordinates);

      // Try to reverse geocode to get location name
      let locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      try {
        // Use a reverse geocoding service if available
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${await getMapboxToken()}&types=place,locality,neighborhood`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          locationText = data.features[0].place_name || locationText;
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed, using coordinates:', geocodeError);
      }

      // Update the user's profile
      const { error } = await supabase
        .from('profiles')
        .update({
          location_text: locationText,
          location_coordinates: coordinates
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setLocation(locationText);
      onLocationUpdate(locationText);
      
      toast({
        title: "GPS location updated",
        description: `Your location is now set to ${locationText}`
      });
    } catch (error) {
      console.error('Error getting GPS location:', error);
      let errorMessage = "Failed to get your GPS location.";
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS location unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "GPS location request timed out.";
            break;
        }
      }
      
      toast({
        title: "GPS Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGettingGPS(false);
    }
  };

  const getMapboxToken = async () => {
    const { data } = await supabase.functions.invoke('geocode-locations', {
      body: { locations: [] }
    });
    return data?.mapboxToken;
  };

  const handleRemoveLocation = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location_text: null,
          location_coordinates: null
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setLocation('');
      onLocationUpdate(null);
      
      toast({
        title: "Location removed",
        description: "Your location has been removed from the map"
      });
    } catch (error) {
      console.error('Error removing location:', error);
      toast({
        title: "Error",
        description: "Failed to remove your location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-3 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Your Location</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Lisbon, Portugal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm"
            disabled={isUpdating}
          />
          {currentLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveLocation}
              disabled={isUpdating}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleUpdateLocation}
            disabled={isUpdating || isGettingGPS || location === currentLocation}
            className="flex-1"
            size="sm"
          >
            {isUpdating ? 'Updating...' : 'Update Location'}
          </Button>
          
          <Button
            onClick={handleGPSLocation}
            disabled={isUpdating || isGettingGPS}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Navigation className="h-4 w-4" />
            {isGettingGPS && <span className="ml-2">...</span>}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Share your location to appear on the travelers map
        </p>
      </div>
    </Card>
  );
};

export default LocationInput;