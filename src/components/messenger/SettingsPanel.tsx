import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from './Avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  User,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Shield,
  Database,
  Smartphone,
  Globe,
  MessageCircle,
  Phone,
  Eye,
  EyeOff,
  X,
  Settings,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'main' | 'profile' | 'notifications' | 'privacy' | 'appearance' | 'devices' | 'language' | 'storage' | 'help';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Settings state
  const [notifications, setNotifications] = useState({
    messages: profile?.notifications_enabled ?? true,
    sounds: profile?.sound_enabled ?? true,
    preview: true,
    vibration: true,
  });

  const [privacy, setPrivacy] = useState({
    showOnline: profile?.show_online_status ?? true,
    showLastSeen: profile?.show_last_seen ?? true,
    showReadReceipts: profile?.show_read_receipts ?? true,
    allowMessagesFrom: profile?.allow_messages_from ?? 'everyone',
    allowCallsFrom: profile?.allow_calls_from ?? 'everyone',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleUpdateNotifications = async (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    if (key === 'messages') {
      await updateProfile({ notifications_enabled: value });
    } else if (key === 'sounds') {
      await updateProfile({ sound_enabled: value });
    }
  };

  const handleUpdatePrivacy = async (key: keyof typeof privacy, value: boolean | string) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    const updateMap: Record<string, any> = {
      showOnline: { show_online_status: value },
      showLastSeen: { show_last_seen: value },
      showReadReceipts: { show_read_receipts: value },
      allowMessagesFrom: { allow_messages_from: value },
      allowCallsFrom: { allow_calls_from: value },
    };
    if (updateMap[key]) {
      await updateProfile(updateMap[key]);
    }
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Профиль', color: 'text-blue-400' },
    { id: 'notifications', icon: Bell, label: 'Уведомления', color: 'text-red-400' },
    { id: 'privacy', icon: Lock, label: 'Приватность', color: 'text-green-400' },
    { id: 'appearance', icon: Palette, label: 'Оформление', color: 'text-purple-400' },
    { id: 'devices', icon: Smartphone, label: 'Устройства', color: 'text-orange-400' },
    { id: 'language', icon: Globe, label: 'Язык', color: 'text-cyan-400' },
    { id: 'storage', icon: Database, label: 'Хранилище', color: 'text-yellow-400' },
    { id: 'help', icon: HelpCircle, label: 'Помощь', color: 'text-pink-400' },
  ];

  const renderMainMenu = () => (
    <div className="space-y-2">
      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-secondary/50 mb-6"
      >
        <div className="flex items-center gap-4">
          <Avatar
            name={profile?.display_name || user?.email || 'User'}
            src={profile?.avatar_url}
            size="lg"
            presence={profile?.presence as any}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{profile?.display_name || 'Пользователь'}</h3>
            <p className="text-sm text-muted-foreground truncate">@{profile?.username || 'username'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveSection('profile')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setActiveSection(item.id as SettingsSection)}
          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <div className={cn('p-2 rounded-lg bg-secondary', item.color)}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.button>
      ))}

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: menuItems.length * 0.05 }}
        onClick={handleSignOut}
        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-messenger-error/10 text-messenger-error transition-colors mt-4"
      >
        <div className="p-2 rounded-lg bg-messenger-error/20">
          <LogOut className="h-5 w-5" />
        </div>
        <span className="flex-1 text-left">Выйти</span>
      </motion.button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <SettingItem
        icon={Bell}
        title="Уведомления о сообщениях"
        description="Получать уведомления о новых сообщениях"
      >
        <Switch
          checked={notifications.messages}
          onCheckedChange={(v) => handleUpdateNotifications('messages', v)}
        />
      </SettingItem>

      <SettingItem
        icon={Volume2}
        title="Звук уведомлений"
        description="Воспроизводить звук при получении сообщений"
      >
        <Switch
          checked={notifications.sounds}
          onCheckedChange={(v) => handleUpdateNotifications('sounds', v)}
        />
      </SettingItem>

      <SettingItem
        icon={Eye}
        title="Предпросмотр сообщений"
        description="Показывать текст сообщения в уведомлении"
      >
        <Switch
          checked={notifications.preview}
          onCheckedChange={(v) => setNotifications(prev => ({ ...prev, preview: v }))}
        />
      </SettingItem>

      <SettingItem
        icon={Smartphone}
        title="Вибрация"
        description="Вибрировать при получении уведомлений"
      >
        <Switch
          checked={notifications.vibration}
          onCheckedChange={(v) => setNotifications(prev => ({ ...prev, vibration: v }))}
        />
      </SettingItem>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <SettingItem
        icon={Eye}
        title="Показывать онлайн статус"
        description="Другие пользователи увидят когда вы онлайн"
      >
        <Switch
          checked={privacy.showOnline}
          onCheckedChange={(v) => handleUpdatePrivacy('showOnline', v)}
        />
      </SettingItem>

      <SettingItem
        icon={EyeOff}
        title="Показывать последний визит"
        description="Другие увидят когда вы были онлайн"
      >
        <Switch
          checked={privacy.showLastSeen}
          onCheckedChange={(v) => handleUpdatePrivacy('showLastSeen', v)}
        />
      </SettingItem>

      <SettingItem
        icon={MessageCircle}
        title="Показывать прочтение"
        description="Отправители увидят что вы прочитали сообщение"
      >
        <Switch
          checked={privacy.showReadReceipts}
          onCheckedChange={(v) => handleUpdatePrivacy('showReadReceipts', v)}
        />
      </SettingItem>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">Кто может отправлять сообщения</h4>
        <div className="space-y-2">
          {['everyone', 'contacts', 'nobody'].map((option) => (
            <button
              key={option}
              onClick={() => handleUpdatePrivacy('allowMessagesFrom', option)}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-colors',
                privacy.allowMessagesFrom === option
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary'
              )}
            >
              {option === 'everyone' && 'Все'}
              {option === 'contacts' && 'Только контакты'}
              {option === 'nobody' && 'Никто'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">Кто может звонить</h4>
        <div className="space-y-2">
          {['everyone', 'contacts', 'nobody'].map((option) => (
            <button
              key={option}
              onClick={() => handleUpdatePrivacy('allowCallsFrom', option)}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-colors',
                privacy.allowCallsFrom === option
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary'
              )}
            >
              {option === 'everyone' && 'Все'}
              {option === 'contacts' && 'Только контакты'}
              {option === 'nobody' && 'Никто'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <SettingItem
        icon={isDarkMode ? Moon : Sun}
        title="Тёмная тема"
        description="Использовать тёмное оформление"
      >
        <Switch
          checked={isDarkMode}
          onCheckedChange={setIsDarkMode}
        />
      </SettingItem>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">Цветовая схема</h4>
        <div className="grid grid-cols-5 gap-3">
          {[
            'hsl(187, 100%, 50%)',
            'hsl(142, 76%, 36%)',
            'hsl(262, 83%, 58%)',
            'hsl(24, 100%, 50%)',
            'hsl(346, 77%, 50%)',
          ].map((color, i) => (
            <button
              key={i}
              className={cn(
                'w-10 h-10 rounded-full transition-transform hover:scale-110',
                i === 0 && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">Размер шрифта</h4>
        <div className="flex items-center gap-4">
          <span className="text-xs">A</span>
          <input
            type="range"
            min="12"
            max="20"
            defaultValue="14"
            className="flex-1 accent-primary"
          />
          <span className="text-xl">A</span>
        </div>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Текущее устройство</h4>
            <p className="text-xs text-muted-foreground">Chrome · Windows</p>
          </div>
          <span className="text-xs text-messenger-online">Активно</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Последняя активность: сейчас
        </p>
      </div>

      <Button variant="outline" className="w-full">
        Завершить все другие сессии
      </Button>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-2">
      {[
        { code: 'ru', name: 'Русский', native: 'Русский' },
        { code: 'en', name: 'English', native: 'English' },
        { code: 'uk', name: 'Ukrainian', native: 'Українська' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'fr', name: 'French', native: 'Français' },
      ].map((lang) => (
        <button
          key={lang.code}
          className={cn(
            'w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between',
            lang.code === 'ru' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
          )}
        >
          <span>{lang.native}</span>
          <span className="text-sm text-muted-foreground">{lang.name}</span>
        </button>
      ))}
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-secondary/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm">Использовано</span>
          <span className="text-sm font-medium">256 МБ / 5 ГБ</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-[5%] bg-primary rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>Фотографии</span>
          <span className="text-muted-foreground">128 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>Видео</span>
          <span className="text-muted-foreground">64 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>Документы</span>
          <span className="text-muted-foreground">32 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>Голосовые сообщения</span>
          <span className="text-muted-foreground">32 МБ</span>
        </div>
      </div>

      <Button variant="outline" className="w-full text-messenger-error hover:bg-messenger-error/10">
        Очистить кеш
      </Button>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-4">
      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">Часто задаваемые вопросы</h4>
        <p className="text-sm text-muted-foreground">Ответы на популярные вопросы</p>
      </button>

      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">Связаться с поддержкой</h4>
        <p className="text-sm text-muted-foreground">Напишите нам если есть проблемы</p>
      </button>

      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">Политика конфиденциальности</h4>
        <p className="text-sm text-muted-foreground">Как мы защищаем ваши данные</p>
      </button>

      <div className="pt-4 text-center">
        <p className="text-sm text-muted-foreground">Messenger Pro v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">© 2025 Все права защищены</p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-6">
        <Avatar
          name={profile?.display_name || 'User'}
          src={profile?.avatar_url}
          size="xl"
        />
        <Button variant="link" className="mt-2 text-primary">
          Изменить фото
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">Имя</label>
          <p className="font-medium">{profile?.display_name || 'Не указано'}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">Имя пользователя</label>
          <p className="font-medium">@{profile?.username || 'не указано'}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">О себе</label>
          <p className="font-medium">{profile?.bio || 'Не указано'}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">Email</label>
          <p className="font-medium">{user?.email}</p>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={() => navigate('/profile')}
      >
        Редактировать профиль
      </Button>
    </div>
  );

  const getSectionTitle = () => {
    const titles: Record<SettingsSection, string> = {
      main: 'Настройки',
      profile: 'Профиль',
      notifications: 'Уведомления',
      privacy: 'Приватность',
      appearance: 'Оформление',
      devices: 'Устройства',
      language: 'Язык',
      storage: 'Хранилище',
      help: 'Помощь',
    };
    return titles[activeSection];
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'main': return renderMainMenu();
      case 'profile': return renderProfile();
      case 'notifications': return renderNotifications();
      case 'privacy': return renderPrivacy();
      case 'appearance': return renderAppearance();
      case 'devices': return renderDevices();
      case 'language': return renderLanguage();
      case 'storage': return renderStorage();
      case 'help': return renderHelp();
      default: return renderMainMenu();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 px-4 flex items-center gap-3 border-b border-border">
              {activeSection !== 'main' ? (
                <button
                  onClick={() => setActiveSection('main')}
                  className="action-button"
                >
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </button>
              ) : (
                <div className="p-2 rounded-lg bg-primary/20">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
              )}
              <h2 className="font-semibold flex-1">{getSectionTitle()}</h2>
              <button onClick={onClose} className="action-button">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingItem({ icon: Icon, title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
