import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import UsersSidebar from '@/components/UsersSidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import Auth from './Auth';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { messages, loading: messagesLoading, sendMessage } = useMessages();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (user) {
      const success = await sendMessage(content, user.id);
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
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Main Chat Area */}
          <ResizablePanel defaultSize={sidebarOpen ? 75 : 100} minSize={50}>
            <div className="flex flex-col h-full">
              {/* Fixed Chat Header */}
              <div className="flex-shrink-0">
                <ChatHeader>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="ml-auto"
                  >
                    {sidebarOpen ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
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
                    <div className="text-4xl mb-4">🇵🇹</div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to Lisbon Travelers!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Share your travel plans, ask for recommendations, and connect with fellow 
                      travelers exploring the beautiful city of Lisbon.
                    </p>
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
              <UsersSidebar />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
