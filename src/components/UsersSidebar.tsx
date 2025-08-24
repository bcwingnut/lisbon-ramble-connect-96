import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import UserLocationMap from '@/components/UserLocationMap';
import LocationInput from '@/components/LocationInput';
import { useState, useEffect } from 'react';

const UsersSidebar = () => {
  const { users, loading, refetch } = useUsers();
  const { user } = useAuth();
  const [currentUserLocation, setCurrentUserLocation] = useState<string | null>(null);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find(u => u.user_id === user.id);
      setCurrentUserLocation(currentUser?.location_text || null);
    }
  }, [user, users]);

  if (loading) {
    return (
        <div className="bg-background h-full flex flex-col">
          <div className="p-4 border-b flex-shrink-0 bg-background">
          <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-pink" />
          <h2 className="font-semibold">Travelers</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background h-full flex flex-col">
      {/* Fixed Header - Always visible at top */}
      <div className="p-4 border-b flex-shrink-0 bg-background">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-pink" />
          <h2 className="font-semibold">Travelers ({users.length})</h2>
        </div>
      </div>
      
      {/* Scrollable Users List Only - Independent scroll */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4 pb-2">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No travelers yet</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.avatar_url} 
                      alt={user.username}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-pink">
                      {user.username}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-success rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                    {user.location_text && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        📍 {user.location_text}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Fixed Footer - Location Input Only */}
      <div className="flex-shrink-0 border-t bg-background">
        <LocationInput 
          currentLocation={currentUserLocation} 
          onLocationUpdate={(location) => {
            console.log('Location updated callback called:', location);
            setCurrentUserLocation(location);
            // Trigger immediate refetch
            console.log('Triggering immediate refetch...');
            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default UsersSidebar;