import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const locations = [
  { path: '/chat/lisbon', label: 'Lisbon', flag: '🇵🇹', description: 'Chat with Lisbon travelers' },
  { path: '/chat/paris', label: 'Paris', flag: '🇫🇷', description: 'Chat with Paris travelers' },
  { path: '/chat/japan', label: 'Japan', flag: '🇯🇵', description: 'Chat with Japan travelers' },
  { path: '/chat/san-francisco', label: 'San Francisco', flag: '🇺🇸', description: 'Chat with SF travelers' },
];

const LocationDropdown = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Find current location based on path
  const currentLocation = locations.find(loc => location.pathname === loc.path) || locations[0];
  const isActive = locations.some(loc => location.pathname === loc.path);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors',
            isActive
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
          )}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span className="mr-1">{currentLocation.flag}</span>
          {currentLocation.label}
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-card border shadow-md z-50"
      >
        {locations.map((loc) => (
          <DropdownMenuItem key={loc.path} asChild className="cursor-pointer">
            <NavLink
              to={loc.path}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-sm w-full"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{loc.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{loc.label}</div>
                <div className="text-xs text-muted-foreground">{loc.description}</div>
              </div>
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationDropdown;