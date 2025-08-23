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
  console.log('🗺️ UserLocationMap RENDER TEST - users:', users?.length || 0);
  
  return (
    <Card className="mt-3 p-4">
      <div className="text-center py-8">
        <div className="text-2xl mb-2">🗺️</div>
        <p className="text-sm text-muted-foreground">
          Test Component - Users: {users?.length || 0}
        </p>
      </div>
    </Card>
  );
};

export default UserLocationMap;