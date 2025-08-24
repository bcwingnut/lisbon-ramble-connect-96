import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Auth from './Auth';
import Navbar from '@/components/Navbar';
import Markdown from '@/components/Markdown';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

const PersonalChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          .is('booking_id', null) // Personal chat messages don't have booking_id
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading chat messages:', error);
          return;
        }

        const formattedMessages: ChatMessage[] = (chatMessages || []).map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          created_at: msg.created_at
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    };

    loadMessages();
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      const { data: userMessageData, error: userError } = await supabase
        .from('chat_messages' as any)
        .insert({
          content: messageContent,
          role: 'user',
          user_id: user.id
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Add user message to local state
      const userMessage: ChatMessage = {
        id: (userMessageData as any).id,
        content: (userMessageData as any).content,
        role: (userMessageData as any).role,
        created_at: (userMessageData as any).created_at
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const { data, error } = await supabase.functions.invoke('gemini-travel-suggestions', {
        body: { 
          message: messageContent,
          userId: user.id,
          isPersonalChat: true
        }
      });

      if (error) {
        throw error;
      }

      const aiResponse = data.response || 'I apologize, but I encountered an issue. Could you please try asking again?';

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

      // Add AI message to local state
      const aiMessage: ChatMessage = {
        id: (aiMessageData as any).id,
        content: (aiMessageData as any).content,
        role: (aiMessageData as any).role,
        created_at: (aiMessageData as any).created_at
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Add error message to local state only (don't save to DB)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Personal Travel Assistant</h1>
              <p className="text-muted-foreground">Your AI guide 2 Go anywhere in the world</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`max-w-[80%] p-4 ${
                  message.role === 'assistant' 
                    ? 'bg-muted' 
                    : 'bg-primary text-primary-foreground ml-auto'
                }`}>
                  <Markdown content={message.content} isInverted={message.role === 'user'} />
                  <span className={`text-xs mt-2 block ${
                    message.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </Card>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about any travel destination..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ask about restaurants, attractions, transportation, or travel planning for any destination worldwide!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalChatbot;