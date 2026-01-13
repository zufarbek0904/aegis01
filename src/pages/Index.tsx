import { useState, useCallback } from 'react';
import { ChatList } from '@/components/messenger/ChatList';
import { ChatView } from '@/components/messenger/ChatView';
import { EmptyState } from '@/components/messenger/EmptyState';
import { mockChats, mockMessages } from '@/data/mockData';
import { Chat, Message } from '@/types/messenger';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    
    // Mark as read
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  }, []);

  const handleBack = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleSendMessage = useCallback((content: string, options?: { isOneTime?: boolean }) => {
    if (!activeChatId) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      content,
      type: 'text',
      status: 'sending',
      timestamp: new Date(),
      isOutgoing: true,
      isOneTime: options?.isOneTime,
    };

    // Add message
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));

    // Update chat last message
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, lastMessage: newMessage }
        : chat
    ));

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
        ),
      }));
    }, 500);

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        ),
      }));
    }, 1500);

    // Simulate read
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
        ),
      }));
    }, 3000);
  }, [activeChatId]);

  // Mobile: show either list or chat
  if (isMobile) {
    return (
      <div className="h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeChatId && activeChat ? (
            <motion.div
              key="chat"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full"
            >
              <ChatView
                chat={activeChat}
                messages={activeMessages}
                onBack={handleBack}
                isMobile={true}
                onSendMessage={handleSendMessage}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full"
            >
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: side by side
  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-[380px] border-r border-border flex-shrink-0">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Chat View */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeChat ? (
            <motion.div
              key={activeChat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatView
                chat={activeChat}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
