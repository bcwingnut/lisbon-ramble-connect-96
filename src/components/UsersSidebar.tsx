import { useUsers } from '@/hooks/useUsers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface UsersSidebarProps {
  className?: string;
}

const UsersSidebar = ({ className = '' }: UsersSidebarProps) => {
  const { users, loading } = useUsers();

  if (loading) {
    return (
      <div className={`bg-card border-r ${className}`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
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
    <div className={`bg-card border-r flex flex-col ${className}`}>
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Travelers ({users.length})</h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-1">
        <div className="space-y-2 p-2">
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
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UsersSidebar;