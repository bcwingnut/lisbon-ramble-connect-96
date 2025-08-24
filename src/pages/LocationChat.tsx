import { useEffect, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import UsersSidebar from '@/components/UsersSidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PanelRightOpen, PanelRightClose, Hotel, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import Auth from './Auth';

// Import background images
import lisbonBg from '@/assets/lisbon-background.jpg';
import parisBg from '@/assets/paris-background.jpg';
import japanBg from '@/assets/japan-background.jpg';
import sanFranciscoBg from '@/assets/san-francisco-background.jpg';

const locationConfig = {
  'lisbon': {
    name: 'Lisbon',
    flag: '🇵🇹',
    description: 'Share your travel plans, ask for recommendations, and connect with fellow travelers exploring the beautiful city of Lisbon.',
    welcome: 'Welcome to Lisbon Travelers!',
    background: lisbonBg,
  },
  'paris': {
    name: 'Paris',
    flag: '🇫🇷',
    description: 'Connect with travelers exploring the City of Light. Share experiences, get recommendations, and plan your Parisian adventure.',
    welcome: 'Welcome to Paris Travelers!',
    background: parisBg,
  },
  'japan': {
    name: 'Japan',
    flag: '🇯🇵',
    description: 'Discover Japan with fellow travelers. Share cultural experiences, travel tips, and connect with others exploring the Land of the Rising Sun.',
    welcome: 'Welcome to Japan Travelers!',
    background: japanBg,
  },
  'san-francisco': {
    name: 'San Francisco',
    flag: '🇺🇸',
    description: 'Connect with travelers exploring the Golden Gate City. Share tech meetups, food spots, and Bay Area adventures.',
    welcome: 'Welcome to San Francisco Travelers!',
    background: sanFranciscoBg,
  },
};

const LocationChat = () => {
  const { location } = useParams<{ location: string }>();
  const { user, loading: authLoading } = useAuth();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(location);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if location is valid
  const locationData = location && locationConfig[location as keyof typeof locationConfig];
  
  // Store current location in localStorage for future visits
  useEffect(() => {
    if (locationData) {
      console.log('Storing location in localStorage:', `/chat/${location}`);
      localStorage.setItem('lastChatLocation', `/chat/${location}`);
    }
  }, [location, locationData]);
  
  if (!locationData) {
    // Get the last visited chat location from localStorage, default to Lisbon
    const getLastChatLocation = () => {
      const lastLocation = localStorage.getItem('lastChatLocation');
      return lastLocation || '/chat/lisbon';
    };
    return <Navigate to={getLastChatLocation()} replace />;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (user) {
      const success = await sendMessage(content, user.id, location);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <Navbar />
      
      {/* Main Content Area - Fixed Height */}
      <div 
        className="flex-1 flex overflow-hidden bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${locationData.background})` }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-secondary/20"></div>
        
        <ResizablePanelGroup direction="horizontal" className="h-full relative z-10">
          {/* Main Chat Area */}
          <ResizablePanel defaultSize={sidebarOpen ? 75 : 100} minSize={50}>
            <div className="flex flex-col h-full backdrop-blur-sm bg-background/80">
              {/* Fixed Chat Header */}
              <div className="flex-shrink-0">
                <ChatHeader 
                  locationName={locationData.name}
                  locationFlag={locationData.flag}
                  locationDescription={`Connect with travelers exploring ${locationData.name}. ${locationData.description.split('. ')[1] || locationData.description}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="ml-auto hover:bg-pink-muted hover:text-pink"
                  >
                    {sidebarOpen ? (
                      <PanelRightClose className="h-4 w-4 text-pink" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4 text-pink" />
                    )}
                  </Button>
                </ChatHeader>
              </div>
              
              {/* Scrollable Messages Area Only */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">{locationData.flag}</div>
                    <h3 className="text-lg font-semibold mb-2">{locationData.welcome}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      {locationData.description}
                    </p>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/booking')}
                        className="hover:bg-pink-muted hover:text-pink hover:border-pink"
                      >
                        <Hotel className="h-4 w-4 mr-2" />
                        Find Hotels
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendMessage(`What are the best areas to stay in ${locationData.name}?`)}
                        className="hover:bg-pink-muted hover:text-pink hover:border-pink"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Best Areas
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendMessage(`Show me budget-friendly hotels in ${locationData.name}`)}
                        className="hover:bg-pink-muted hover:text-pink hover:border-pink"
                      >
                        Budget Hotels
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendMessage(`What attractions are near hotels in ${locationData.name}?`)}
                        className="hover:bg-pink-muted hover:text-pink hover:border-pink"
                      >
                        Near Attractions
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.user_id === user.id}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Fixed Chat Input */}
              <div className="flex-shrink-0">
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  disabled={messagesLoading}
                />
              </div>
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          {sidebarOpen && <ResizableHandle withHandle />}

          {/* Fixed Sidebar - Always Visible */}
          {sidebarOpen && (
            <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
              <div className="backdrop-blur-sm bg-background/90 h-full">
                <UsersSidebar />
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default LocationChat;