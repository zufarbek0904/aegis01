import { Chat, Message } from '@/types/messenger';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingBubble } from './TypingIndicator';
import { Avatar } from './Avatar';
import { ForwardMessageDialog } from './ForwardMessageDialog';
import { EditMessageDialog } from './EditMessageDialog';
import { MessageSearch } from './MessageSearch';
import { PinnedMessage } from './PinnedMessage';
import { VoicePlayer } from './VoicePlayer';
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatViewProps {
  chat: Chat;
  messages: Message[];
  allChats?: Chat[];
  onBack?: () => void;
  isMobile?: boolean;
  onSendMessage: (content: string, options?: { 
    isOneTime?: boolean; 
    type?: string; 
    mediaUrl?: string;
    replyToId?: string;
  }) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onForwardMessage?: (chatIds: string[], message: Message) => void;
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  return format(date, 'd MMMM', { locale: ru });
}

export function ChatView({ 
  chat, 
  messages, 
  allChats = [],
  onBack, 
  isMobile = false, 
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onForwardMessage
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);

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

  // Clear state when chat changes
  useEffect(() => {
    setReplyTo(null);
    setForwardMessage(null);
    setEditMessage(null);
    setPinnedMessage(null);
    setShowSearch(false);
  }, [chat.id]);

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

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleForward = useCallback((message: Message) => {
    setForwardMessage(message);
  }, []);

  const handleDelete = useCallback((message: Message) => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
      toast.success('Сообщение удалено');
    }
  }, [onDeleteMessage]);

  const handlePin = useCallback((message: Message) => {
    setPinnedMessage(prev => prev?.id === message.id ? null : message);
    toast.success(pinnedMessage?.id === message.id ? 'Сообщение откреплено' : 'Сообщение закреплено');
  }, [pinnedMessage]);

  const handleEdit = useCallback((message: Message) => {
    if (message.isOutgoing && message.type === 'text') {
      setEditMessage(message);
    }
  }, []);

  const handleSaveEdit = useCallback((messageId: string, newContent: string) => {
    if (onEditMessage) {
      onEditMessage(messageId, newContent);
      toast.success('Сообщение отредактировано');
    }
  }, [onEditMessage]);

  const handleForwardSubmit = useCallback((chatIds: string[], message: Message) => {
    if (onForwardMessage) {
      onForwardMessage(chatIds, message);
      toast.success(`Сообщение переслано в ${chatIds.length} чат(ов)`);
    }
  }, [onForwardMessage]);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/10');
      setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
    }
  }, []);

  const handleSendMessage = useCallback((content: string, options?: any) => {
    onSendMessage(content, {
      ...options,
      replyToId: replyTo?.id
    });
    setReplyTo(null);
  }, [onSendMessage, replyTo]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <ChatHeader 
        chat={chat} 
        onBack={onBack} 
        isMobile={isMobile}
        onSearchClick={() => setShowSearch(prev => !prev)}
      />

      {/* Forward Dialog */}
      <ForwardMessageDialog
        open={forwardMessage !== null}
        onOpenChange={(open) => !open && setForwardMessage(null)}
        message={forwardMessage}
        chats={allChats.filter(c => c.id !== chat.id)}
        onForward={handleForwardSubmit}
      />

      <EditMessageDialog
        open={editMessage !== null}
        onOpenChange={(open) => !open && setEditMessage(null)}
        message={editMessage}
        onSave={handleSaveEdit}
      />

      {/* Search Panel */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <MessageSearch
              messages={messages}
              onScrollToMessage={handleScrollToMessage}
              onClose={() => setShowSearch(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Message */}
      <AnimatePresence>
        {pinnedMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PinnedMessage
              message={pinnedMessage}
              onUnpin={() => setPinnedMessage(null)}
              onScrollToMessage={() => handleScrollToMessage(pinnedMessage.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-4"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--secondary) / 0.3) 0%, transparent 70%)',
        }}
      >
        <div className="space-y-3 sm:space-y-4">
          {groupedMessages.map((group, groupIndex) => (
            <div key={group.date.toISOString()} className="space-y-2 sm:space-y-3">
              {/* Date Separator */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 sm:px-4 py-1 sm:py-1.5 bg-card/80 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-muted-foreground"
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
                    id={`message-${message.id}`}
                    className={`flex gap-1.5 sm:gap-2 w-full transition-colors duration-500 ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    {chat.isGroup && !message.isOutgoing && (
                      <div className="w-7 sm:w-8 flex-shrink-0">
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
                      onReply={handleReply}
                      onForward={handleForward}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onEdit={handleEdit}
                      onScrollToMessage={handleScrollToMessage}
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
                className="flex gap-1.5 sm:gap-2"
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
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
