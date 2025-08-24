import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [messages, setMessages] = useState<BookingMessage[]>([
    {
      id: '1',
      content: "Welcome to AI Hotel Booking! 🏨 I'm your AI assistant ready to help you find the perfect accommodation anywhere in the world. Tell me about your travel plans - where are you going, when are you visiting, how many guests, and what type of experience are you looking for?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const generateBotResponse = (userMessage: string): BookingMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses for demo
    if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay')) {
      const randomHotel = sampleHotels[Math.floor(Math.random() * sampleHotels.length)];
      return {
        id: Date.now().toString(),
        content: `Great! I found some excellent options for you. Here's a highly recommended hotel:

**${randomHotel.name}**
📍 ${randomHotel.location}
💰 Starting from ${randomHotel.price}
⭐ ${randomHotel.rating}/5 rating

This hotel offers: ${randomHotel.amenities.join(', ')}

Would you like to see more options, or do you have specific requirements like budget range, preferred area, or special amenities?`,
        isBot: true,
        timestamp: new Date(),
        hotelData: randomHotel
      };
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
      return {
        id: Date.now().toString(),
        content: "I'd be happy to help you find hotels within your budget! Most destinations offer great options across different price ranges:\n\n💰 **Budget-friendly**: €40-80/night (hostels, budget hotels)\n💰 **Mid-range**: €80-150/night (boutique hotels, business hotels)\n💰 **Luxury**: €150+/night (5-star hotels, luxury resorts)\n\nWhat's your preferred budget range per night and which destination are you traveling to?",
        isBot: true,
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('district')) {
      return {
        id: Date.now().toString(),
        content: "I can help you find the best areas to stay in your destination! Different neighborhoods offer unique experiences:\n\n🏛️ **Historic District**: Cultural sites, museums, traditional architecture\n🛍️ **City Center**: Shopping, restaurants, nightlife\n🏖️ **Waterfront**: Beach access, scenic views, relaxed atmosphere\n🌆 **Business District**: Modern amenities, transport links, conference facilities\n🎭 **Arts Quarter**: Galleries, theaters, trendy cafes\n\nWhich destination are you visiting, and what type of experience interests you most?",
        isBot: true,
        timestamp: new Date()
      };
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('confirm')) {
      return {
        id: Date.now().toString(),
        content: "Excellent! To proceed with your booking, I'll need a few details:\n\n📅 **Check-in & Check-out dates**\n👥 **Number of guests**\n🛏️ **Room preferences** (single, double, suite)\n📧 **Contact information**\n\nOnce you provide these details, I can check availability and guide you through the secure booking process. Most hotels offer free cancellation up to 24-48 hours before arrival!",
        isBot: true,
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      content: "I'm here to help you find and book the perfect hotel anywhere in the world! I can assist you with:\n\n🏨 Hotel recommendations based on your preferences\n💰 Budget-friendly options and pricing\n📍 Best areas to stay for different interests\n🎯 Specific amenities (WiFi, parking, breakfast, etc.)\n📅 Availability and booking assistance\n🌍 Destinations worldwide\n\nWhat destination are you planning to visit and what would you like to know?",
      isBot: true,
      timestamp: new Date()
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const userMessage: BookingMessage = {
      id: Date.now().toString(),
      content,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Simulate AI processing time
    setTimeout(() => {
      const botResponse = generateBotResponse(content);
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1000 + Math.random() * 1000);
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
            <h1 className="text-3xl font-bold text-primary mb-2">🏨 Hotel Booking Assistant</h1>
            <p className="text-muted-foreground">
              Find and book the perfect accommodation anywhere in the world with AI assistance
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendMessage("Show me budget-friendly hotels")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Budget Hotels
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendMessage("What are the best areas to stay?")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Best Areas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendMessage("Show me luxury hotels with spa")}
            >
              <Star className="h-4 w-4 mr-2" />
              Luxury Options
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendMessage("Hotels near tourist attractions")}
            >
              <Users className="h-4 w-4 mr-2" />
              Near Attractions
            </Button>
          </div>
        </div>

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
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
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