import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';
import type { Message } from '@/hooks/useMessages';
import Markdown from '@/components/Markdown';
import LinkChips from '@/components/LinkChips';
import TravelMap from '@/components/TravelMap';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const isAi = !isOwn && (message.profiles.username === 'AI Travel Assistant' || message.content.startsWith('🤖 AI:'));

  // Extract URLs from content
  const urls = (message.content.match(/https?:\/\/[^\s)]+/g) || []).slice(0, 6);
  
  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isOwn && (
        <Avatar className={`h-8 w-8 mt-1 ${isAi ? 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse' : ''}`}>
          <AvatarFallback className={`text-xs ${isAi ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-accent text-accent-foreground'}`}>
            {isAi ? <Bot className="h-4 w-4" /> : message.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs mb-1 px-1 text-pink font-medium">
            {message.profiles.username}
          </span>
        )}
        
        <Card className={`p-3 transition-all duration-300 hover-scale ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : isAi 
              ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gradient-to-r from-blue-200 to-purple-200 shadow-lg animate-scale-in' 
              : 'bg-background'
        }`}>
          <Markdown content={message.content} isInverted={isOwn} />
          {isAi && urls.length > 0 && (
            <LinkChips urls={urls} />
          )}
          {isAi && (
            <TravelMap content={message.content} />
          )}
        </Card>
        
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {timeAgo}
        </span>
      </div>
      
      {isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;