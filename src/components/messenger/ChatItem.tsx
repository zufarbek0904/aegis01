import { Chat } from '@/types/messenger';
import { Avatar } from './Avatar';
import { TypingIndicator } from './TypingIndicator';
import { MessageStatus } from './MessageStatus';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Pin, VolumeX, Image, Mic, FileText, Music, MapPin, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ru });
  }
  if (isYesterday(date)) {
    return 'Вчера';
  }
  return format(date, 'd MMM', { locale: ru });
}

function getMessagePreview(chat: Chat): React.ReactNode {
  const msg = chat.lastMessage;
  if (!msg) return 'Нет сообщений';

  const icons: Record<string, React.ReactNode> = {
    photo: <Image className="w-4 h-4 inline mr-1" />,
    voice: <Mic className="w-4 h-4 inline mr-1" />,
    video_message: <Video className="w-4 h-4 inline mr-1" />,
    file: <FileText className="w-4 h-4 inline mr-1" />,
    music: <Music className="w-4 h-4 inline mr-1" />,
    location: <MapPin className="w-4 h-4 inline mr-1" />,
  };

  const typeLabels: Record<string, string> = {
    photo: 'Фото',
    voice: 'Голосовое сообщение',
    video_message: 'Видео-сообщение',
    file: 'Файл',
    music: 'Музыка',
    location: 'Геолокация',
  };

  if (msg.type !== 'text') {
    return (
      <span className="flex items-center text-muted-foreground">
        {icons[msg.type]}
        {msg.content || typeLabels[msg.type]}
      </span>
    );
  }

  return msg.content;
}

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  const mainParticipant = chat.participants[0];
  const isTyping = chat.activity?.type === 'typing';
  const typingUser = chat.isGroup && chat.activity 
    ? chat.participants.find(p => p.id === chat.activity?.userId)?.name 
    : undefined;

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--chat-hover))' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'chat-item flex items-center gap-3 px-4 py-3 cursor-pointer relative',
        isActive && 'chat-item-active'
      )}
    >
      <Avatar
        name={chat.name}
        src={chat.avatar}
        presence={mainParticipant?.presence}
        size="lg"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold truncate">{chat.name}</h3>
            {chat.isMuted && (
              <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {chat.lastMessage?.isOutgoing && (
              <MessageStatus 
                status={chat.lastMessage.status} 
                className="w-4 h-4" 
              />
            )}
            <span className="text-xs text-muted-foreground">
              {chat.lastMessage && formatMessageTime(chat.lastMessage.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex-1 min-w-0">
            {chat.activity ? (
              <TypingIndicator
                userName={typingUser}
                activityType={chat.activity.type}
                isGroup={chat.isGroup}
              />
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastMessage?.isOutgoing && (
                  <span className="text-foreground">Вы: </span>
                )}
                {getMessagePreview(chat)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {chat.isPinned && (
              <Pin className="w-3.5 h-3.5 text-muted-foreground rotate-45" />
            )}
            {chat.unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="min-w-5 h-5 rounded-full bg-primary flex items-center justify-center px-1.5"
              >
                <span className="text-xs font-semibold text-primary-foreground">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
