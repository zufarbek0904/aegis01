import { useState, useCallback, useEffect } from 'react';
import { ChatList } from '@/components/messenger/ChatList';
import { ChatView } from '@/components/messenger/ChatView';
import { EmptyState } from '@/components/messenger/EmptyState';
import { SettingsPanel } from '@/components/messenger/SettingsPanel';
import { NewChatDialog } from '@/components/messenger/NewChatDialog';
import { NewGroupDialog } from '@/components/messenger/NewGroupDialog';
import { AIChatButton } from '@/components/messenger/AIChatButton';
import { Chat, Message } from '@/types/messenger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { chats: supabaseChats, loading: chatsLoading, fetchChats, markAsRead } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const isMobile = useIsMobile();

  // Initialize notifications
  const { requestPermission, permission } = useNotifications();

  // Request notification permission on first load
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const { messages: supabaseMessages, sendMessage, editMessage, deleteMessage, forwardMessage, markAsRead: markMessagesAsRead, loading: messagesLoading } = useMessages(activeChatId);
  
  // Mark messages as read when viewing chat
  useEffect(() => {
    if (activeChatId && supabaseMessages.length > 0) {
      const unreadIds = supabaseMessages
        .filter(m => m.sender_id !== user?.id && (m.status === 'sent' || m.status === 'delivered'))
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markMessagesAsRead(unreadIds);
      }
    }
  }, [activeChatId, supabaseMessages, user?.id, markMessagesAsRead]);

  // Convert Supabase chats to app Chat format
  const chats: Chat[] = supabaseChats.map(chat => {
    const otherMember = chat.members.find((m: any) => m.user_id !== user?.id);
    const displayName = chat.type === 'private' && otherMember?.profile
      ? (otherMember.profile.display_name || otherMember.profile.username || 'Пользователь')
      : (chat.name || 'Группа');

    const avatarUrl = chat.type === 'private' && otherMember?.profile
      ? otherMember.profile.avatar_url
      : chat.avatar_url;

    return {
      id: chat.id,
      name: displayName,
      avatar: avatarUrl || '',
      isGroup: chat.type !== 'private',
      participants: chat.members.map((m: any) => ({
        id: m.user_id,
        name: m.profile?.display_name || m.profile?.username || 'User',
        avatar: m.profile?.avatar_url || '',
        presence: m.profile?.presence || 'offline',
      })),
      lastMessage: chat.lastMessage ? {
        id: chat.lastMessage.id,
        senderId: chat.lastMessage.sender_id,
        content: chat.lastMessage.content || '',
        type: chat.lastMessage.type || 'text',
        status: chat.lastMessage.status || 'sent',
        timestamp: new Date(chat.lastMessage.created_at),
        isOutgoing: chat.lastMessage.sender_id === user?.id,
      } : undefined,
      unreadCount: chat.unreadCount,
      isPinned: false,
      isMuted: false,
      activity: chat.typingUsers.length > 0 ? {
        userId: chat.typingUsers[0],
        type: 'typing' as const,
      } : undefined,
    };
  });

  // Convert Supabase messages to app Message format
  const messages: Message[] = supabaseMessages.map(msg => ({
    id: msg.id,
    senderId: msg.sender_id,
    content: msg.content || '',
    type: (msg.type as Message['type']) || 'text',
    status: (msg.status as Message['status']) || 'sent',
    timestamp: new Date(msg.created_at),
    isOutgoing: msg.sender_id === user?.id,
    mediaUrl: msg.media_url || undefined,
    duration: msg.media_duration || undefined,
    isOneTime: msg.is_one_time || false,
    isEdited: msg.is_edited || false,
    editedAt: msg.edited_at ? new Date(msg.edited_at) : undefined,
    replyTo: msg.replyToMessage ? {
      id: msg.replyToMessage.id,
      senderId: msg.replyToMessage.sender_id,
      senderName: msg.replyToMessage.sender?.display_name || msg.replyToMessage.sender?.username || 'Пользователь',
      content: msg.replyToMessage.content || '',
      type: (msg.replyToMessage.type as Message['type']) || 'text',
    } : undefined,
    forwardedFrom: msg.forwarded_from_id ? {
      id: msg.forwarded_from_id,
      senderName: 'Пользователь',
    } : undefined,
  }));

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    markAsRead(chatId);
  }, [markAsRead]);

  const handleBack = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleSendMessage = useCallback(async (content: string, options?: { 
    isOneTime?: boolean; 
    type?: string; 
    mediaUrl?: string;
    replyToId?: string;
  }) => {
    if (!activeChatId) return;
    await sendMessage(content, { 
      type: options?.type || 'text', 
      isOneTime: options?.isOneTime,
      mediaUrl: options?.mediaUrl,
      replyToId: options?.replyToId
    });
  }, [activeChatId, sendMessage]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent);
  }, [editMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await deleteMessage(messageId);
  }, [deleteMessage]);

  const handleForwardMessage = useCallback(async (chatIds: string[], message: Message) => {
    for (const chatId of chatIds) {
      await forwardMessage(chatId, {
        id: message.id,
        chat_id: activeChatId!,
        sender_id: message.senderId,
        content: message.content,
        type: message.type,
        status: message.status,
        media_url: message.mediaUrl || null,
        media_duration: message.duration || null,
        is_one_time: message.isOneTime || null,
        reply_to_id: null,
        is_edited: message.isEdited || null,
        is_deleted: false,
        created_at: message.timestamp.toISOString(),
        edited_at: null,
        forwarded_from_id: null,
        delivered_at: null,
        read_at: null,
        sender: null,
      });
    }
  }, [activeChatId, forwardMessage]);

  const handleChatCreated = useCallback((chatId: string) => {
    fetchChats();
    setActiveChatId(chatId);
  }, [fetchChats]);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Loading state
  if (authLoading || chatsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Mobile: show either list or chat
  if (isMobile) {
    return (
      <div className="h-screen w-full overflow-hidden">
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <NewChatDialog
          open={isNewChatOpen}
          onOpenChange={setIsNewChatOpen}
          onChatCreated={handleChatCreated}
          onCreateGroup={() => setIsNewGroupOpen(true)}
        />
        <NewGroupDialog
          open={isNewGroupOpen}
          onOpenChange={setIsNewGroupOpen}
          onGroupCreated={handleChatCreated}
        />
        
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
                messages={messages}
                allChats={chats}
                onBack={handleBack}
                isMobile={true}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onForwardMessage={handleForwardMessage}
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
                onOpenSettings={() => setIsSettingsOpen(true)}
                onNewChat={() => setIsNewChatOpen(true)}
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
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onChatCreated={handleChatCreated}
        onCreateGroup={() => setIsNewGroupOpen(true)}
      />
      <NewGroupDialog
        open={isNewGroupOpen}
        onOpenChange={setIsNewGroupOpen}
        onGroupCreated={handleChatCreated}
      />
      
      {/* Chat List Sidebar */}
      <div className="w-[380px] border-r border-border flex-shrink-0">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewChat={() => setIsNewChatOpen(true)}
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
                messages={messages}
                allChats={chats}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onForwardMessage={handleForwardMessage}
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

      {/* AI Chat Button */}
      <AIChatButton />
    </div>
  );
};

export default Index;
