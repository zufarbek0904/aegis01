import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from './Avatar';
import { Message, Chat } from '@/types/messenger';
import { Search, Forward, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  chats: Chat[];
  onForward: (chatIds: string[], message: Message) => void;
}

export function ForwardMessageDialog({
  open,
  onOpenChange,
  message,
  chats,
  onForward,
}: ForwardMessageDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedChats([]);
    }
  }, [open]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleChat = (chatId: string) => {
    setSelectedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleForward = () => {
    if (message && selectedChats.length > 0) {
      onForward(selectedChats, message);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="w-5 h-5" />
            Переслать сообщение
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск чатов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Message Preview */}
          {message && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Пересылаемое сообщение:</p>
              <p className="text-sm truncate">{message.content || '[Медиа]'}</p>
            </div>
          )}

          {/* Chat List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => toggleChat(chat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    selectedChats.includes(chat.id)
                      ? 'bg-primary/10'
                      : 'hover:bg-secondary'
                  )}
                >
                  <div className="relative">
                    <Avatar name={chat.name} src={chat.avatar} size="md" />
                    {selectedChats.includes(chat.id) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{chat.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {chat.isGroup ? 'Группа' : 'Личный чат'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Forward Button */}
          <Button
            onClick={handleForward}
            disabled={selectedChats.length === 0}
            className="w-full"
          >
            Переслать {selectedChats.length > 0 && `(${selectedChats.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
