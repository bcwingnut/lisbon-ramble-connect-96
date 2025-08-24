import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bot, Hotel, MapPin, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import LocationDropdown from './LocationDropdown';
import love2GoLogo from '@/assets/love2go-logo-transparent.png';

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    {
      path: '/personal-chatbot',
      label: 'Personal Chatbot',
      icon: Bot,
      description: 'AI travel assistant'
    },
    {
      path: '/traveler-map',
      label: 'Activities',
      icon: MapPin,
      description: 'See what other travelers are doing'
    },
    {
      path: '/booking',
      label: 'Booking',
      icon: Hotel,
      description: 'Book hotels with AI assistance'
    }
  ];

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src={love2GoLogo} alt="Love2Go" className="h-24 w-24 mr-4" />
              <span className="text-2xl font-bold text-brand font-poppins">Love2Go</span>
            </div>
            <div className="ml-6 flex space-x-8">
              <LocationDropdown />
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2 text-pink" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Welcome message and Sign Out */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Hi <span className="font-medium text-foreground">{user.user_metadata?.username || user.email?.split('@')[0] || 'User'}</span>
              </span>
              <Button variant="pink-outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;