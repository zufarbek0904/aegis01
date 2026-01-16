import { Chat } from '@/types/messenger';
import { ChatItem } from './ChatItem';
import { Input } from '@/components/ui/input';
import { Search, Menu, Settings, Edit } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenSettings?: () => void;
  onNewChat?: () => void;
}

export function ChatList({ chats, activeChatId, onSelectChat, onOpenSettings, onNewChat }: ChatListProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const regularChats = filteredChats.filter(c => !c.isPinned);

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <button className="action-button" onClick={onOpenSettings}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gradient">Messenger</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="action-button" onClick={onOpenSettings}>
            <Settings className="w-5 h-5" />
          </button>
          <button className="action-button" onClick={onNewChat}>
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('chat.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-accent border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {pinnedChats.length > 0 && (
          <div className="py-1">
            {pinnedChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChatItem
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onClick={() => onSelectChat(chat.id)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {pinnedChats.length > 0 && regularChats.length > 0 && (
          <div className="mx-4 border-t border-sidebar-border" />
        )}

        <div className="py-1">
          {regularChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (pinnedChats.length + index) * 0.05 }}
            >
              <ChatItem
                chat={chat}
                isActive={chat.id === activeChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            </motion.div>
          ))}
        </div>

        {filteredChats.length === 0 && (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>{t('chat.chatsNotFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
