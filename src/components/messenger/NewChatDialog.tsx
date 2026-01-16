import { useState, useEffect, forwardRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import { Search, MessageCircle, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  presence: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string) => void;
  onCreateGroup: () => void;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated, onCreateGroup }: NewChatDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
    } else {
      setSearchQuery('');
      setUsers([]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const debounce = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, open]);

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, presence')
        .neq('id', user.id)
        .limit(20);

      if (searchQuery.trim()) {
        query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Ошибка загрузки пользователей');
        return;
      }
      
      setUsers((data as UserProfile[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;
    setCreating(otherUserId);

    try {
      const { data: chatId, error } = await supabase.rpc('get_or_create_private_chat', {
        p_user_id: user.id,
        p_other_user_id: otherUserId
      });

      if (error) {
        console.error('Error creating chat:', error);
        toast.error('Ошибка создания чата');
        return;
      }

      if (chatId) {
        toast.success('Чат создан');
        onChatCreated(chatId);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка создания чата');
    } finally {
      setCreating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('chat.newChat')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create Group Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14"
            onClick={() => {
              onOpenChange(false);
              onCreateGroup();
            }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium">{t('chat.createGroup')}</div>
              <div className="text-xs text-muted-foreground">{t('chat.upTo200')}</div>
            </div>
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchUsers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? t('chat.noUsersFound') : t('chat.noAvailableUsers')}
              </div>
            ) : (
              users.map((profile, index) => (
                <motion.button
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleStartChat(profile.id)}
                  disabled={creating === profile.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.display_name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {profile.presence === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {profile.display_name || profile.username || t('common.user')}
                    </div>
                    {profile.username && profile.display_name && (
                      <div className="text-sm text-muted-foreground">@{profile.username}</div>
                    )}
                  </div>
                  {creating === profile.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
