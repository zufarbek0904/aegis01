import { Message } from '@/types/messenger';
import { MessageStatus } from './MessageStatus';
import { MessageContextMenu } from './MessageContextMenu';
import { MessageReactions } from './MessageReactions';
import { QuotedMessage } from './QuotedMessage';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Play, Pause, Image, FileText, Music, MapPin, Eye, Forward, Pencil } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  senderName?: string;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export function MessageBubble({ 
  message, 
  showAvatar, 
  senderName,
  onReply,
  onForward,
  onDelete,
  onPin,
  onEdit,
  onScrollToMessage
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  const formattedTime = format(message.timestamp, 'HH:mm', { locale: ru });

  const bubbleClass = message.isOutgoing 
    ? 'message-bubble-outgoing' 
    : 'message-bubble-incoming';

  const handleReaction = (emoji: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.reacted) {
          if (existing.count === 1) {
            return prev.filter(r => r.emoji !== emoji);
          }
          return prev.map(r => 
            r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r
          );
        }
        return prev.map(r => 
          r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r
        );
      }
      return [...prev, { emoji, count: 1, reacted: true }];
    });
  };

  const renderContent = () => {
    switch (message.type) {
      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[180px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
                message.isOutgoing 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-primary/20 hover:bg-primary/30'
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-0.5 h-8">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'w-0.5 rounded-full flex-shrink-0',
                      message.isOutgoing ? 'bg-white/60' : 'bg-primary/60'
                    )}
                    animate={{
                      height: isPlaying 
                        ? [8, Math.random() * 20 + 8, 8] 
                        : Math.random() * 14 + 6,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: isPlaying ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                    style={{ height: Math.random() * 14 + 6 }}
                  />
                ))}
              </div>
              <span className="text-xs opacity-70">
                {Math.floor((message.duration || 0) / 60)}:{String((message.duration || 0) % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        );

      case 'video_message':
        return (
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Play className="w-10 h-10 text-white" />
            </div>
            {message.isOneTime && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <Eye className="w-4 h-4" />
              </div>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="relative max-w-[240px] rounded-lg overflow-hidden">
            {message.mediaUrl ? (
              <img 
                src={message.mediaUrl} 
                alt="Photo" 
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <Image className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            {message.isOneTime && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                <Eye className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 text-white">
              {formattedTime}
              {message.isOutgoing && <MessageStatus status={message.status} className="w-3 h-3" />}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              message.isOutgoing ? 'bg-white/20' : 'bg-primary/20'
            )}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{message.content || 'Документ.pdf'}</p>
              <p className="text-xs opacity-70">2.4 MB</p>
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
                message.isOutgoing 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-primary/20 hover:bg-primary/30'
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Название трека</p>
              <p className="text-xs opacity-70 truncate">Исполнитель</p>
            </div>
            <Music className="w-5 h-5 opacity-50 flex-shrink-0" />
          </div>
        );

      case 'location':
        return (
          <div className="w-52 h-28 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>;
    }
  };

  const bubbleContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'max-w-[85%] sm:max-w-[75%] flex flex-col gap-1',
        message.isOutgoing ? 'items-end' : 'items-start'
      )}
    >
      {/* Forwarded indicator */}
      {message.forwardedFrom && (
        <div className={cn(
          'flex items-center gap-1 text-xs px-3',
          message.isOutgoing ? 'text-white/60' : 'text-muted-foreground'
        )}>
          <Forward className="w-3 h-3" />
          <span>Переслано от {message.forwardedFrom.senderName}</span>
        </div>
      )}

      {senderName && !message.isOutgoing && (
        <span className="text-xs text-primary font-medium px-3">{senderName}</span>
      )}
      
      <div
        className={cn(
          'rounded-2xl px-3 py-2',
          bubbleClass,
          message.type === 'photo' && 'p-0 overflow-hidden',
          message.type === 'video_message' && 'p-0 bg-transparent'
        )}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <QuotedMessage
            senderName={message.replyTo.senderName}
            content={message.replyTo.content}
            type={message.replyTo.type}
            isOutgoing={message.isOutgoing}
            onClick={() => onScrollToMessage?.(message.replyTo!.id)}
          />
        )}

        {renderContent()}
        
        {message.type !== 'photo' && message.type !== 'video_message' && (
          <div className={cn(
            'flex items-center gap-1.5 mt-1',
            message.isOutgoing ? 'justify-end' : 'justify-start'
          )}>
            {message.isEdited && (
              <span className="text-[10px] opacity-50 flex items-center gap-0.5">
                <Pencil className="w-2.5 h-2.5" />
                ред.
              </span>
            )}
            <span className="text-[10px] opacity-60">{formattedTime}</span>
            {message.isOutgoing && (
              <MessageStatus status={message.status} className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>

      {/* Reactions */}
      <MessageReactions
        reactions={reactions}
        onReact={handleReaction}
        isOutgoing={message.isOutgoing}
      />
    </motion.div>
  );

  return (
    <MessageContextMenu
      message={message}
      onReply={onReply}
      onForward={onForward}
      onDelete={onDelete}
      onPin={onPin}
      onEdit={onEdit}
      onReaction={() => handleReaction('👍')}
    >
      {bubbleContent}
    </MessageContextMenu>
  );
}
