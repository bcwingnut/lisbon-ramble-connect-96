import React from 'react';
import { Card } from '@/components/ui/card';

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
  console.log('🗺️ SIMPLE TEST - UserLocationMap called with', users?.length || 0, 'users');
  
  const usersWithCoords = users.filter(u => u.location_coordinates);
  console.log('🗺️ Users with coordinates:', usersWithCoords.length);
  
  return (
    <Card className="mt-3 p-4">
      <div className="text-center py-4">
        <div className="text-2xl mb-2">🗺️</div>
        <p className="text-sm text-muted-foreground">
          Map Component Loading - {users?.length || 0} total users, {usersWithCoords.length} with locations
        </p>
        {usersWithCoords.map(user => (
          <div key={user.id} className="text-xs mt-1">
            {user.username}: {user.location_text || 'No location text'}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserLocationMap;