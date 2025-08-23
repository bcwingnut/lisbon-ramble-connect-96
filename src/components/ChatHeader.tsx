import { Button } from '@/components/ui/button';
import { LogOut, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface ChatHeaderProps {
  children?: ReactNode;
}

const ChatHeader = ({ children }: ChatHeaderProps) => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-lg font-semibold">Lisbon Travelers 🇵🇹</h1>
          <p className="text-sm text-muted-foreground">Planning adventures in Portugal</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {children}
        <span className="text-sm text-muted-foreground hidden sm:block">
          Welcome back!
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;