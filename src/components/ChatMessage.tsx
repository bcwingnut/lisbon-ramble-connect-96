import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs bg-accent text-accent-foreground">
            {message.profiles.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.profiles.username}
          </span>
        )}
        
        <Card className={`p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
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