import { cn } from '@/lib/utils';

interface QuotedMessageProps {
  senderName: string;
  content: string;
  type?: string;
  isOutgoing?: boolean;
  onClick?: () => void;
}

export function QuotedMessage({ 
  senderName, 
  content, 
  type = 'text',
  isOutgoing = false,
  onClick 
}: QuotedMessageProps) {
  const getContentPreview = () => {
    switch (type) {
      case 'photo':
        return '📷 Фото';
      case 'video':
        return '🎬 Видео';
      case 'voice':
        return '🎤 Голосовое сообщение';
      case 'video_message':
        return '📹 Видеосообщение';
      case 'file':
        return '📎 Файл';
      case 'music':
        return '🎵 Музыка';
      case 'location':
        return '📍 Геолокация';
      default:
        return content || '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-2 rounded-lg mb-1 border-l-2 transition-colors',
        isOutgoing 
          ? 'bg-white/10 border-white/50 hover:bg-white/20' 
          : 'bg-primary/10 border-primary hover:bg-primary/20'
      )}
    >
      <p className={cn(
        'text-xs font-medium',
        isOutgoing ? 'text-white/80' : 'text-primary'
      )}>
        {senderName}
      </p>
      <p className={cn(
        'text-sm truncate',
        isOutgoing ? 'text-white/60' : 'text-muted-foreground'
      )}>
        {getContentPreview()}
      </p>
    </button>
  );
}
