import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PresenceStatus } from '@/types/messenger';

interface LastSeenStatusProps {
  presence: PresenceStatus;
  lastSeen?: Date | string | null;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
  className?: string;
}

export function LastSeenStatus({ 
  presence, 
  lastSeen, 
  showOnlineStatus = true,
  showLastSeen = true,
  className 
}: LastSeenStatusProps) {
  if (!showOnlineStatus && !showLastSeen) {
    return null;
  }

  const getStatusText = () => {
    if (presence === 'online' && showOnlineStatus) {
      return 'в сети';
    }
    
    if (presence === 'invisible') {
      return null;
    }

    if (presence === 'recently') {
      return 'был(а) недавно';
    }

    if (lastSeen && showLastSeen) {
      const lastSeenDate = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
      return `был(а) ${formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: ru })}`;
    }

    return 'не в сети';
  };

  const statusText = getStatusText();
  if (!statusText) return null;

  return (
    <span className={cn(
      'text-xs',
      presence === 'online' ? 'text-green-500' : 'text-muted-foreground',
      className
    )}>
      {statusText}
    </span>
  );
}
