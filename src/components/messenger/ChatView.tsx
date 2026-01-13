import { Chat, Message } from '@/types/messenger';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingBubble } from './TypingIndicator';
import { Avatar } from './Avatar';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatViewProps {
  chat: Chat;
  messages: Message[];
  onBack?: () => void;
  isMobile?: boolean;
  onSendMessage: (content: string, options?: { isOneTime?: boolean }) => void;
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  return format(date, 'd MMMM', { locale: ru });
}

export function ChatView({ chat, messages, onBack, isMobile = false, onSendMessage }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  useEffect(() => {
    if (chat.activity) {
      setShowTyping(true);
    } else {
      const timeout = setTimeout(() => setShowTyping(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [chat.activity]);

  // Group messages by date
  const groupedMessages: { date: Date; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && isSameDay(lastGroup.date, msg.timestamp)) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msg.timestamp, messages: [msg] });
    }
  });

  return (
    <div className="h-full flex flex-col bg-background">
      <ChatHeader chat={chat} onBack={onBack} isMobile={isMobile} />

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--secondary) / 0.3) 0%, transparent 70%)',
        }}
      >
        {groupedMessages.map((group, groupIndex) => (
          <div key={group.date.toISOString()} className="space-y-3">
            {/* Date Separator */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-1.5 bg-card/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground"
              >
                {formatDateSeparator(group.date)}
              </motion.div>
            </div>

            {/* Messages */}
            {group.messages.map((message, msgIndex) => {
              const prevMessage = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
              const showAvatar = !message.isOutgoing && 
                (!prevMessage || prevMessage.senderId !== message.senderId);
              
              const sender = chat.isGroup && !message.isOutgoing
                ? chat.participants.find(p => p.id === message.senderId)
                : null;

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.isGroup && !message.isOutgoing && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && sender && (
                        <Avatar
                          name={sender.name}
                          size="sm"
                          showPresence={false}
                        />
                      )}
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    showAvatar={showAvatar}
                    senderName={showAvatar && sender ? sender.name : undefined}
                  />
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex gap-2"
            >
              {chat.isGroup && chat.activity && (
                <Avatar
                  name={chat.participants.find(p => p.id === chat.activity?.userId)?.name || ''}
                  size="sm"
                  showPresence={false}
                />
              )}
              <TypingBubble />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
