import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PinnedMessageProps {
  message: {
    id: string;
    content: string;
    senderId?: string;
    senderName?: string;
  };
  onUnpin?: () => void;
  onScrollToMessage?: () => void;
  canUnpin?: boolean;
}

export function PinnedMessage({ message, onUnpin, onScrollToMessage, canUnpin = true }: PinnedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
      onClick={onScrollToMessage}
    >
      <Pin className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{message.senderName || 'Закреплённое сообщение'}</p>
        <p className="text-sm text-muted-foreground truncate">{message.content}</p>
      </div>
      {canUnpin && onUnpin && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin();
          }}
          className="h-6 w-6 shrink-0"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  );
}
