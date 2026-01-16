import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import { Search, Check, ArrowRight, Loader2, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  presence: string;
}

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (chatId: string) => void;
}

export function NewGroupDialog({ open, onOpenChange, onGroupCreated }: NewGroupDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'members' | 'details'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    } else {
      // Reset state when dialog closes
      setStep('members');
      setSelectedUsers([]);
      setGroupName('');
      setSearchQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (open && step === 'members') {
      fetchUsers();
    }
  }, [searchQuery]);

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, presence')
      .neq('id', user.id)
      .limit(50);

    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
    }

    const { data } = await query;
    setUsers((data as UserProfile[]) || []);
    setLoading(false);
  };

  const toggleUser = (profile: UserProfile) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === profile.id);
      if (exists) {
        return prev.filter(u => u.id !== profile.id);
      }
      return [...prev, profile];
    });
  };

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim() || selectedUsers.length === 0) return;
    setCreating(true);

    try {
      // Create the group chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          name: groupName.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (chatError || !chat) throw chatError;

      // Add creator as owner
      await supabase.from('chat_members').insert({
        chat_id: chat.id,
        user_id: user.id,
        role: 'owner'
      });

      // Add selected members
      await supabase.from('chat_members').insert(
        selectedUsers.map(u => ({
          chat_id: chat.id,
          user_id: u.id,
          role: 'member' as const
        }))
      );

      onGroupCreated(chat.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'members' ? 'Выберите участников' : 'Новая группа'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'members' ? (
            <motion.div
              key="members"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Selected users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(profile => (
                    <motion.div
                      key={profile.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1 bg-primary/10 text-primary rounded-full pl-1 pr-2 py-1"
                    >
                      <Avatar
                        src={profile.avatar_url || ''}
                        name={profile.display_name || profile.username || 'User'}
                        size="xs"
                      />
                      <span className="text-sm">
                        {profile.display_name || profile.username}
                      </span>
                      <button
                        onClick={() => toggleUser(profile)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users List */}
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                  </div>
                ) : (
                  users.map((profile, index) => {
                    const isSelected = selectedUsers.some(u => u.id === profile.id);
                    return (
                      <motion.button
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => toggleUser(profile)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                        }`}
                      >
                        <Avatar
                          src={profile.avatar_url || ''}
                          name={profile.display_name || profile.username || 'User'}
                          size="md"
                          presence={profile.presence as any}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium">
                            {profile.display_name || profile.username || 'Пользователь'}
                          </div>
                          {profile.username && profile.display_name && (
                            <div className="text-sm text-muted-foreground">@{profile.username}</div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Next Button */}
              <Button
                className="w-full"
                disabled={selectedUsers.length === 0}
                onClick={() => setStep('details')}
              >
                Далее
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Group Avatar */}
              <div className="flex justify-center">
                <button className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Camera className="w-8 h-8 text-primary" />
                </button>
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Название группы</label>
                <Input
                  placeholder="Введите название..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Selected Members Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Участники: {selectedUsers.length}
                </label>
                <div className="flex -space-x-2">
                  {selectedUsers.slice(0, 5).map(profile => (
                    <Avatar
                      key={profile.id}
                      src={profile.avatar_url || ''}
                      name={profile.display_name || profile.username || 'User'}
                      size="sm"
                      className="border-2 border-background"
                    />
                  ))}
                  {selectedUsers.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{selectedUsers.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('members')} className="flex-1">
                  Назад
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || creating}
                  className="flex-1"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Создать'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
