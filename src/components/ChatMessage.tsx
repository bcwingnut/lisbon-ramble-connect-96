import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '@/hooks/useMessages';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
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
          <p className="text-sm break-words">{message.content}</p>
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