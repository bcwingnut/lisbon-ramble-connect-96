import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';
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
        
        <Button
          onClick={handleUpdateLocation}
          disabled={isUpdating || location === currentLocation}
          className="w-full"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update Location'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Share your location to appear on the travelers map
        </p>
      </div>
    </Card>
  );
};

export default LocationInput;