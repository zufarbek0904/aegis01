import { Chat, User, PresenceStatus } from '@/types/messenger';
import { Avatar } from './Avatar';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  isMobile?: boolean;
}

function getPresenceText(user: User): string {
  switch (user.presence) {
    case 'online':
      return 'онлайн';
    case 'recently':
      return 'был недавно';
    case 'invisible':
    case 'offline':
      if (user.lastSeen) {
        return `был ${format(user.lastSeen, 'd MMM в HH:mm', { locale: ru })}`;
      }
      return 'был давно';
    default:
      return '';
  }
}

export function ChatHeader({ chat, onBack, isMobile = false }: ChatHeaderProps) {
  const mainParticipant = chat.participants[0];
  const isTyping = !!chat.activity;
  const typingUser = chat.isGroup && chat.activity 
    ? chat.participants.find(p => p.id === chat.activity?.userId)?.name 
    : undefined;

  return (
    <div className="h-16 px-4 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-xl">
      {isMobile && (
        <button onClick={onBack} className="action-button -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <Avatar
        name={chat.name}
        src={chat.avatar}
        presence={mainParticipant?.presence}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">{chat.name}</h2>
        <div className="text-sm">
          {isTyping ? (
            <TypingIndicator
              userName={typingUser}
              activityType={chat.activity!.type}
              isGroup={chat.isGroup}
            />
          ) : chat.isGroup ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {chat.participants.length} участников
            </span>
          ) : (
            <span className={cn(
              'text-muted-foreground',
              mainParticipant?.presence === 'online' && 'text-messenger-online'
            )}>
              {mainParticipant && getPresenceText(mainParticipant)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="action-button">
          <Search className="w-5 h-5" />
        </button>
        <button className="action-button">
          <Phone className="w-5 h-5" />
        </button>
        <button className="action-button">
          <Video className="w-5 h-5" />
        </button>
        <button className="action-button">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
