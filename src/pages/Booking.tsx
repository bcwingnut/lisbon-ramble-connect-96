import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Users, Star, Wifi, Car, Coffee, Utensils } from 'lucide-react';
import Auth from './Auth';

interface BookingMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  hotelData?: {
    name: string;
    location: string;
    price: string;
    rating: number;
    amenities: string[];
    image?: string;
  };
}

const Booking = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Booking form state
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [showBookingForm, setShowBookingForm] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing chat messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;

      try {
        const { data: chatMessages, error } = await supabase
          .from('chat_messages' as any)
          .select('*')
          .eq('user_id', user.id)
          .is('booking_id', null) // For now, we'll use null booking_id for hotel chat
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading chat messages:', error);
          return;
        }

        if (chatMessages && chatMessages.length > 0) {
          const formattedMessages: BookingMessage[] = chatMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            isBot: msg.role === 'assistant',
            timestamp: new Date(msg.created_at)
          }));
          setMessages(formattedMessages);
        } else {
          // Add welcome message if no chat history
          setMessages([{
            id: '1',
            content: "Hello there! 👋 I'm Sophia, your dedicated hotel concierge! I'm absolutely thrilled to help you discover the most amazing accommodations for your next adventure. I've personally curated recommendations from boutique gems to luxury resorts worldwide. \n\nTo get started, please fill out the booking form above with your travel details, and I'll craft personalized recommendations just for you! ✨",
            isBot: true,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
        // Add welcome message on error
        setMessages([{
          id: '1',
          content: "Hello there! 👋 I'm Sophia, your dedicated hotel concierge! I'm absolutely thrilled to help you discover the most amazing accommodations for your next adventure. I've personally curated recommendations from boutique gems to luxury resorts worldwide. \n\nTo get started, please fill out the booking form above with your travel details, and I'll craft personalized recommendations just for you! ✨",
          isBot: true,
          timestamp: new Date()
        }]);
      }
    };

    loadMessages();
  }, [user]);

  // Sample hotel data for demonstration
  const sampleHotels = [
    {
      name: "Tivoli Oriente Lisboa",
      location: "Oriente Station, Lisbon",
      price: "€120/night",
      rating: 4.5,
      amenities: ["Free WiFi", "Parking", "Restaurant", "Fitness Center"],
      image: "🏨"
    },
    {
      name: "Memmo Alfama Hotel",
      location: "Alfama District, Lisbon", 
      price: "€95/night",
      rating: 4.3,
      amenities: ["Free WiFi", "Rooftop Bar", "City Views", "Restaurant"],
      image: "🏛️"
    },
    {
      name: "Hotel Real Palácio",
      location: "Marquês de Pombal, Lisbon",
      price: "€140/night", 
      rating: 4.7,
      amenities: ["Free WiFi", "Spa", "Indoor Pool", "Business Center"],
      image: "👑"
    }
  ];

  const callBookingAssistant = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('hotel-booking-assistant', {
        body: { 
          message: userMessage, 
          userId: user?.id,
          chatHistory: messages.slice(-6) // Send last 6 messages for context
        }
      });

      if (error) {
        console.error('Booking assistant error:', error);
        return "I'm sorry, I'm having trouble accessing hotel information right now. Please try again or ask me about specific destinations and I'll do my best to help!";
      }

      return data?.response || data?.fallbackResponse || "I couldn't process your request. Please try asking about hotels, destinations, or booking assistance.";
    } catch (error) {
      console.error('Error calling booking assistant:', error);
      return "I'm experiencing technical difficulties. Please try again in a moment or let me know what destination you're interested in!";
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    setLoading(true);

    try {
      // Save user message to database
      const { data: userMessageData, error: userError } = await supabase
        .from('chat_messages' as any)
        .insert({
          content: content,
          role: 'user',
          user_id: user.id
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      const userMessage: BookingMessage = {
        id: (userMessageData as any).id,
        content,
        isBot: false,
        timestamp: new Date((userMessageData as any).created_at)
      };

      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await callBookingAssistant(content);
      
      // Save AI response to database
      const { data: aiMessageData, error: aiError } = await supabase
        .from('chat_messages' as any)
        .insert({
          content: aiResponse,
          role: 'assistant',
          user_id: user.id
        })
        .select()
        .single();

      if (aiError) {
        throw aiError;
      }

      const botResponse: BookingMessage = {
        id: (aiMessageData as any).id,
        content: aiResponse,
        isBot: true,
        timestamp: new Date((aiMessageData as any).created_at)
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error handling message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to local state only (don't save to DB)
      const errorResponse: BookingMessage = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I'm having trouble right now. Please try again or let me know what destination you're interested in visiting!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    // For now, this doesn't do anything as requested
    console.log('Form submitted:', {
      numberOfPeople,
      checkInDate,
      checkOutDate
    });
  };

  const renderAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
      case 'free parking':
        return <Car className="h-4 w-4" />;
      case 'restaurant':
      case 'dining':
        return <Utensils className="h-4 w-4" />;
      case 'fitness center':
      case 'gym':
      case 'spa':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="p-6 border-b bg-card">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">✨ Sophia - Your Hotel Concierge</h1>
            <p className="text-muted-foreground">
              Personalized luxury accommodations curated just for you
            </p>
          </div>
        </div>

        {/* Booking Form */}
        {showBookingForm && (
          <div className="p-6 border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">Tell me about your perfect stay</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Number of People */}
                <div className="space-y-2">
                  <Label htmlFor="people">Number of Guests</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="people"
                      type="number"
                      min="1"
                      max="20"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkInDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkOutDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={(date) => date < (checkInDate || new Date())}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                onClick={handleFormSubmit}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                size="lg"
              >
                ✨ Find My Perfect Hotel
              </Button>
            </Card>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${message.isBot ? '' : 'order-1'}`}>
                  <div
                    className={`p-4 rounded-lg ${
                      message.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <Markdown content={message.content} isInverted={!message.isBot} />
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hotel Card */}
              {message.hotelData && (
                <div className="flex justify-start">
                  <Card className="max-w-md p-4 bg-card border">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{message.hotelData.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{message.hotelData.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {message.hotelData.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{message.hotelData.rating}</span>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {message.hotelData.price}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {message.hotelData.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                            {renderAmenityIcon(amenity)}
                            {amenity}
                          </div>
                        ))}
                      </div>
                      
                      <Button className="w-full" size="sm">
                        View Details & Book
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t bg-card p-4">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;