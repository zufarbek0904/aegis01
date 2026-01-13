import { Message } from '@/types/messenger';
import { MessageStatus } from './MessageStatus';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Play, Pause, Image, FileText, Music, MapPin, Eye } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  senderName?: string;
}

export function MessageBubble({ message, showAvatar, senderName }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formattedTime = format(message.timestamp, 'HH:mm', { locale: ru });

  const bubbleClass = message.isOutgoing 
    ? 'message-bubble-outgoing ml-auto' 
    : 'message-bubble-incoming';

  const animationClass = message.isOutgoing 
    ? 'animate-message-out' 
    : 'animate-message-in';

  const renderContent = () => {
    switch (message.type) {
      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
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
            <div className="flex-1">
              <div className="flex items-center gap-1 h-8">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'w-1 rounded-full',
                      message.isOutgoing ? 'bg-white/60' : 'bg-primary/60'
                    )}
                    animate={{
                      height: isPlaying 
                        ? [8, Math.random() * 24 + 8, 8] 
                        : Math.random() * 16 + 8,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: isPlaying ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                    style={{ height: Math.random() * 16 + 8 }}
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
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
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
          <div className="relative max-w-xs rounded-lg overflow-hidden">
            {message.mediaUrl ? (
              <img 
                src={message.mediaUrl} 
                alt="Photo" 
                className="w-full h-auto"
              />
            ) : (
              <div className="w-64 h-48 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {message.isOneTime && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                <Eye className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
              {formattedTime}
              {message.isOutgoing && <MessageStatus status={message.status} className="w-3 h-3" />}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              message.isOutgoing ? 'bg-white/20' : 'bg-primary/20'
            )}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{message.content || 'Документ.pdf'}</p>
              <p className="text-xs opacity-70">2.4 MB</p>
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="flex items-center gap-3 min-w-[240px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                message.isOutgoing 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-primary/20 hover:bg-primary/30'
              )}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <p className="font-medium">Название трека</p>
              <p className="text-xs opacity-70">Исполнитель</p>
            </div>
            <Music className="w-5 h-5 opacity-50" />
          </div>
        );

      case 'location':
        return (
          <div className="w-64 h-32 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'max-w-[75%] flex flex-col gap-1',
        message.isOutgoing ? 'items-end' : 'items-start'
      )}
    >
      {senderName && !message.isOutgoing && (
        <span className="text-xs text-primary font-medium px-3">{senderName}</span>
      )}
      <div
        className={cn(
          'rounded-message px-4 py-2.5',
          bubbleClass,
          message.type === 'photo' && 'p-0 overflow-hidden'
        )}
      >
        {renderContent()}
        
        {message.type !== 'photo' && (
          <div className={cn(
            'flex items-center gap-1.5 mt-1',
            message.isOutgoing ? 'justify-end' : 'justify-start'
          )}>
            <span className="text-[10px] opacity-60">{formattedTime}</span>
            {message.isOutgoing && (
              <MessageStatus status={message.status} className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
