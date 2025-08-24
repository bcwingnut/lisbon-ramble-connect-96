import { MapPin } from 'lucide-react';
import { ReactNode } from 'react';

interface ChatHeaderProps {
  children?: ReactNode;
  locationName?: string;
  locationFlag?: string;
  locationDescription?: string;
}

const ChatHeader = ({ children, locationName = 'Lisbon', locationFlag = '🇵🇹', locationDescription = 'Planning adventures in Portugal' }: ChatHeaderProps) => {

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-pink" />
        <div>
          <h1 className="text-lg font-semibold">{locationName} Travelers {locationFlag}</h1>
          <p className="text-sm text-muted-foreground">{locationDescription}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
};

export default ChatHeader;