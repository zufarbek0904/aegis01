import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar } from '@/components/messenger/Avatar';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  Save, 
  LogOut,
  Shield,
  Bell,
  Eye,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, profile, signOut, updateProfile, updatePresence } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [presence, setPresence] = useState(profile?.presence || 'online');
  
  // Privacy settings
  const [showOnlineStatus, setShowOnlineStatus] = useState(profile?.show_online_status ?? true);
  const [showLastSeen, setShowLastSeen] = useState(profile?.show_last_seen ?? true);
  const [showReadReceipts, setShowReadReceipts] = useState(profile?.show_read_receipts ?? true);
  const [allowCallsFrom, setAllowCallsFrom] = useState(profile?.allow_calls_from || 'everyone');
  const [allowMessagesFrom, setAllowMessagesFrom] = useState(profile?.allow_messages_from || 'everyone');
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(profile?.sound_enabled ?? true);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить аватар',
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await updateProfile({ avatar_url: publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);

    await updateProfile({
      display_name: displayName,
      username,
      bio,
      show_online_status: showOnlineStatus,
      show_last_seen: showLastSeen,
      show_read_receipts: showReadReceipts,
      allow_calls_from: allowCallsFrom,
      allow_messages_from: allowMessagesFrom,
      notifications_enabled: notificationsEnabled,
      sound_enabled: soundEnabled,
    });

    await updatePresence(presence as 'online' | 'offline' | 'invisible');

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="action-button">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Профиль</h1>
          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-6"
        >
          <div className="relative">
            <Avatar
              name={displayName || username || 'User'}
              src={profile.avatar_url}
              presence={presence as any}
              size="xl"
              showPresence={false}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-primary-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </motion.div>

        {/* Basic Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Основная информация
          </h2>

          <div className="space-y-2">
            <Label htmlFor="displayName">Отображаемое имя</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ваше имя"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={presence} onValueChange={setPresence}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">🟢 Онлайн</SelectItem>
                <SelectItem value="offline">⚫ Не в сети</SelectItem>
                <SelectItem value="invisible">👻 Невидимка</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* Privacy Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Приватность
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Показывать статус онлайн</Label>
              <p className="text-xs text-muted-foreground">Другие увидят, когда вы в сети</p>
            </div>
            <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Показывать последний визит</Label>
              <p className="text-xs text-muted-foreground">Другие увидят, когда вы были онлайн</p>
            </div>
            <Switch checked={showLastSeen} onCheckedChange={setShowLastSeen} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Отчёты о прочтении</Label>
              <p className="text-xs text-muted-foreground">Показывать, что вы прочитали сообщение</p>
            </div>
            <Switch checked={showReadReceipts} onCheckedChange={setShowReadReceipts} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Кто может звонить
            </Label>
            <Select value={allowCallsFrom} onValueChange={setAllowCallsFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Все</SelectItem>
                <SelectItem value="contacts">Только контакты</SelectItem>
                <SelectItem value="nobody">Никто</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Кто может писать
            </Label>
            <Select value={allowMessagesFrom} onValueChange={setAllowMessagesFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Все</SelectItem>
                <SelectItem value="contacts">Только контакты</SelectItem>
                <SelectItem value="nobody">Никто</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* Notification Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-4 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Уведомления
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Уведомления</Label>
              <p className="text-xs text-muted-foreground">Получать уведомления о сообщениях</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Звук</Label>
              <p className="text-xs text-muted-foreground">Звуковые уведомления</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
        </motion.section>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
