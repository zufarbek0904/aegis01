import { Message } from '@/types/messenger';
import { X, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyPreviewProps {
  message: Message;
  senderName?: string;
  onCancel: () => void;
  className?: string;
}

export function ReplyPreview({ message, senderName, onCancel, className }: ReplyPreviewProps) {
  const getContentPreview = () => {
    switch (message.type) {
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
        return message.content || '';
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 bg-secondary/50 rounded-lg border-l-2 border-primary',
      className
    )}>
      <Reply className="w-4 h-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">
          {senderName || (message.isOutgoing ? 'Вы' : 'Собеседник')}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {getContentPreview()}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-secondary rounded-full transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
