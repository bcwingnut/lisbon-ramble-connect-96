import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import Navbar from '@/components/Navbar';
import Auth from './Auth';
import UserLocationMap from '@/components/UserLocationMap';
import LocationInput from '@/components/LocationInput';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

const TravelerMap = () => {
  const { user } = useAuth();
  const { users, loading, refetch } = useUsers();
  const [currentUserLocation, setCurrentUserLocation] = useState<string | null>(null);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find(u => u.user_id === user.id);
      setCurrentUserLocation(currentUser?.location_text || null);
    }
  }, [user, users]);

  if (!user) {
    return <Auth />;
  }

  const usersWithLocations = users.filter(u => u.location_text);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Traveler Map</h1>
          </div>
          <p className="text-muted-foreground">
            See where fellow travelers are located around the world and share your own location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Global Traveler Locations</h2>
                <p className="text-sm text-muted-foreground">
                  Interactive map showing {usersWithLocations.length} travelers with shared locations
                </p>
              </div>
              
              <UserLocationMap users={users} />
            </Card>
          </div>

          {/* Sidebar with travelers list and location input */}
          <div className="space-y-6">
            {/* Location Input */}
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Share Your Location</h3>
                <p className="text-sm text-muted-foreground">
                  Let other travelers know where you are or where you're planning to go.
                </p>
              </div>
              
              <LocationInput 
                currentLocation={currentUserLocation} 
                onLocationUpdate={(location) => {
                  console.log('Location updated:', location);
                  setCurrentUserLocation(location);
                  refetch();
                }}
              />
            </Card>

            {/* Travelers List */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">All Travelers ({users.length})</h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No travelers yet</p>
                      </div>
                    ) : (
                      users.map((traveler) => (
                        <div
                          key={traveler.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={traveler.avatar_url} 
                              alt={traveler.username}
                            />
                            <AvatarFallback className="text-sm bg-primary/10 text-primary">
                              {traveler.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {traveler.username}
                            </p>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">Online</span>
                            </div>
                            {traveler.location_text ? (
                              <p className="text-sm text-muted-foreground truncate mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {traveler.location_text}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground italic mt-1">
                                Location not shared
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerMap;