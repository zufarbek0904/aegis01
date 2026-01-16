import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Message } from '@/types/messenger';
import { 
  Reply, 
  Forward, 
  Copy, 
  Trash2, 
  Pin, 
  Smile,
  Edit,
  BookmarkPlus
} from 'lucide-react';

interface MessageContextMenuProps {
  message: Message;
  children: React.ReactNode;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onReaction?: (message: Message) => void;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export function MessageContextMenu({ 
  message, 
  children,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onPin,
  onEdit,
  onReaction
}: MessageContextMenuProps) {
  const [showReactions, setShowReactions] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
    onCopy?.(message);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Quick Reactions */}
        <div className="flex items-center justify-around px-2 py-2 border-b border-border">
          {quickReactions.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReaction?.(message)}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowReactions(true)}
            className="p-1 hover:bg-secondary rounded-full"
          >
            <Smile className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <ContextMenuItem onClick={() => onReply?.(message)} className="gap-3">
          <Reply className="w-4 h-4" />
          <span>Ответить</span>
        </ContextMenuItem>

        {message.isOutgoing && (
          <ContextMenuItem onClick={() => onEdit?.(message)} className="gap-3">
            <Edit className="w-4 h-4" />
            <span>Редактировать</span>
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={handleCopy} className="gap-3">
          <Copy className="w-4 h-4" />
          <span>Копировать</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onForward?.(message)} className="gap-3">
          <Forward className="w-4 h-4" />
          <span>Переслать</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onPin?.(message)} className="gap-3">
          <Pin className="w-4 h-4" />
          <span>Закрепить</span>
        </ContextMenuItem>

        <ContextMenuItem className="gap-3">
          <BookmarkPlus className="w-4 h-4" />
          <span>В избранное</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem 
          onClick={() => onDelete?.(message)} 
          className="gap-3 text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span>Удалить</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
