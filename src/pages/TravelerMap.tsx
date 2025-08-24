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
import { Users, MapPin, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TravelerMap = () => {
  const { user } = useAuth();
  const { users, loading, refetch } = useUsers();
  const [currentUserLocation, setCurrentUserLocation] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [destinationActivities, setDestinationActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Filter out AI Travel Assistant from users list
  const realUsers = users.filter(u => u.username !== 'AI Travel Assistant');

  // Fetch user activities and destination activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch user activities
        const { data: userActivitiesData, error: userError } = await supabase
          .from('user_activities')
          .select('*, profiles!user_activities_user_id_fkey(username, location_text)');
          
        if (userError) {
          console.error('Error fetching user activities:', userError);
        } else {
          setUserActivities(userActivitiesData || []);
        }

        // Fetch destination activities  
        const { data: destActivitiesData, error: destError } = await supabase
          .from('destination_activities')
          .select('*');
          
        if (destError) {
          console.error('Error fetching destination activities:', destError);
        } else {
          setDestinationActivities(destActivitiesData || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (user && realUsers.length > 0) {
      const currentUser = realUsers.find(u => u.user_id === user.id);
      setCurrentUserLocation(currentUser?.location_text || null);
    }
  }, [user, realUsers]);

  if (!user) {
    return <Auth />;
  }

  const usersWithLocations = realUsers.filter(u => u.location_text);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Activities</h1>
          </div>
          <p className="text-muted-foreground">
            See what travelers are doing around the world and discover popular activities at each destination.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Global Activities Map</h2>
                <p className="text-sm text-muted-foreground">
                  {realUsers.length} travelers • {destinationActivities.length} destination activities
                </p>
              </div>
              
              <UserLocationMap users={realUsers} />
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

            {/* Recent Activities */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Recent Activities</h3>
              </div>

              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {userActivities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No user activities yet</p>
                        <p className="text-xs mt-1">Be the first to share what you're doing!</p>
                      </div>
                    ) : (
                      userActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="text-xl">
                            {activity.activity_type === 'food' ? '🍴' : 
                             activity.activity_type === 'sightseeing' ? '📸' :
                             activity.activity_type === 'adventure' ? '🏔️' :
                             activity.activity_type === 'culture' ? '🎭' : '✨'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {activity.profiles?.username || 'Anonymous'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.activity_description}
                            </p>
                            {activity.location_text && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {activity.location_text}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {activity.activity_type}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </Card>

            {/* Popular Destination Activities */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Popular Activities ({destinationActivities.length})</h3>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {destinationActivities.slice(0, 20).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-xl">
                        {activity.activity_type === 'food' ? '🍴' : 
                         activity.activity_type === 'sightseeing' ? '📸' :
                         activity.activity_type === 'adventure' ? '🏔️' :
                         activity.activity_type === 'culture' ? '🎭' :
                         activity.activity_type === 'outdoor' ? '🌿' :
                         activity.activity_type === 'entertainment' ? '🎪' :
                         activity.activity_type === 'shopping' ? '🛍️' : '✨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">
                            {activity.activity_name}
                          </p>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs">⭐</span>
                            <span className="text-xs font-medium">{activity.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-primary font-medium">
                            📍 {activity.destination}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {activity.activity_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerMap;