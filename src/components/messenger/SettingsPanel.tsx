import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdmin } from '@/hooks/useAdmin';
import { Avatar } from './Avatar';
import { LastSeenStatus } from './LastSeenStatus';
import { SupportDialog } from './SupportDialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  Smartphone,
  Globe,
  MessageCircle,
  Eye,
  EyeOff,
  X,
  Settings,
  Check,
  Database,
  Shield,
  Sparkles,
  HeadphonesIcon,
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
  const { language, setLanguage, t, languages } = useLanguage();
  const { isAdmin, userRole } = useAdmin();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [fontSize, setFontSize] = useState(14);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [accentColor, setAccentColor] = useState(0);
  
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

  // Update settings from profile
  useEffect(() => {
    if (profile) {
      setNotifications(prev => ({
        ...prev,
        messages: profile.notifications_enabled ?? true,
        sounds: profile.sound_enabled ?? true,
      }));
      setPrivacy(prev => ({
        ...prev,
        showOnline: profile.show_online_status ?? true,
        showLastSeen: profile.show_last_seen ?? true,
        showReadReceipts: profile.show_read_receipts ?? true,
        allowMessagesFrom: profile.allow_messages_from ?? 'everyone',
        allowCallsFrom: profile.allow_calls_from ?? 'everyone',
      }));
    }
  }, [profile]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Font size effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleUpdateNotifications = async (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    try {
      if (key === 'messages') {
        await updateProfile({ notifications_enabled: value });
        toast.success(t('notifications.messages') + ': ' + (value ? 'Вкл' : 'Выкл'));
      } else if (key === 'sounds') {
        await updateProfile({ sound_enabled: value });
        toast.success(t('notifications.sounds') + ': ' + (value ? 'Вкл' : 'Выкл'));
      }
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    }
  };

  const handleUpdatePrivacy = async (key: keyof typeof privacy, value: boolean | string) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    try {
      const updateMap: Record<string, any> = {
        showOnline: { show_online_status: value },
        showLastSeen: { show_last_seen: value },
        showReadReceipts: { show_read_receipts: value },
        allowMessagesFrom: { allow_messages_from: value },
        allowCallsFrom: { allow_calls_from: value },
      };
      if (updateMap[key]) {
        await updateProfile(updateMap[key]);
        toast.success('Настройки приватности обновлены');
      }
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any);
    toast.success('Язык изменён');
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast.success('Кеш очищен. Страница будет перезагружена.');
    setTimeout(() => window.location.reload(), 1000);
  };

  const menuItems = [
    { id: 'profile', icon: User, label: t('settings.profile'), color: 'text-blue-400' },
    { id: 'notifications', icon: Bell, label: t('settings.notifications'), color: 'text-red-400' },
    { id: 'privacy', icon: Lock, label: t('settings.privacy'), color: 'text-green-400' },
    { id: 'appearance', icon: Palette, label: t('settings.appearance'), color: 'text-purple-400' },
    { id: 'devices', icon: Smartphone, label: t('settings.devices'), color: 'text-orange-400' },
    { id: 'language', icon: Globe, label: t('settings.language'), color: 'text-cyan-400' },
    { id: 'storage', icon: Database, label: t('settings.storage'), color: 'text-yellow-400' },
    { id: 'help', icon: HelpCircle, label: t('settings.help'), color: 'text-pink-400' },
  ];

  const specialItems = [
    ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Админ-панель', color: 'text-red-500', onClick: () => { onClose(); navigate('/admin'); } }] : []),
    { id: 'ai', icon: Sparkles, label: 'AI Ассистент', color: 'text-purple-500', onClick: () => { onClose(); /* navigate to AI */ } },
    { id: 'support', icon: HeadphonesIcon, label: 'Поддержка', color: 'text-green-500', onClick: () => setShowSupportDialog(true) },
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
            showPresence
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{profile?.display_name || t('common.user')}</h3>
              {isAdmin && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-400 font-medium">
                  {userRole}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">@{profile?.username || 'username'}</p>
            <LastSeenStatus 
              presence={profile?.presence as any} 
              lastSeen={profile?.last_seen}
            />
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

      {/* Special items (Admin, AI, Support) */}
      {specialItems.length > 0 && (
        <div className="mb-4 space-y-2">
          {specialItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className={cn('p-2 rounded-lg bg-secondary', item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      )}

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
        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors mt-4"
      >
        <div className="p-2 rounded-lg bg-destructive/20">
          <LogOut className="h-5 w-5" />
        </div>
        <span className="flex-1 text-left">{t('settings.logout')}</span>
      </motion.button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <SettingItem
        icon={Bell}
        title={t('notifications.messages')}
        description={t('notifications.messages.desc')}
      >
        <Switch
          checked={notifications.messages}
          onCheckedChange={(v) => handleUpdateNotifications('messages', v)}
        />
      </SettingItem>

      <SettingItem
        icon={Volume2}
        title={t('notifications.sounds')}
        description={t('notifications.sounds.desc')}
      >
        <Switch
          checked={notifications.sounds}
          onCheckedChange={(v) => handleUpdateNotifications('sounds', v)}
        />
      </SettingItem>

      <SettingItem
        icon={Eye}
        title={t('notifications.preview')}
        description={t('notifications.preview.desc')}
      >
        <Switch
          checked={notifications.preview}
          onCheckedChange={(v) => setNotifications(prev => ({ ...prev, preview: v }))}
        />
      </SettingItem>

      <SettingItem
        icon={Smartphone}
        title={t('notifications.vibration')}
        description={t('notifications.vibration.desc')}
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
        title={t('privacy.showOnline')}
        description={t('privacy.showOnline.desc')}
      >
        <Switch
          checked={privacy.showOnline}
          onCheckedChange={(v) => handleUpdatePrivacy('showOnline', v)}
        />
      </SettingItem>

      <SettingItem
        icon={EyeOff}
        title={t('privacy.showLastSeen')}
        description={t('privacy.showLastSeen.desc')}
      >
        <Switch
          checked={privacy.showLastSeen}
          onCheckedChange={(v) => handleUpdatePrivacy('showLastSeen', v)}
        />
      </SettingItem>

      <SettingItem
        icon={MessageCircle}
        title={t('privacy.showReadReceipts')}
        description={t('privacy.showReadReceipts.desc')}
      >
        <Switch
          checked={privacy.showReadReceipts}
          onCheckedChange={(v) => handleUpdatePrivacy('showReadReceipts', v)}
        />
      </SettingItem>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">{t('privacy.whoCanMessage')}</h4>
        <div className="space-y-2">
          {['everyone', 'contacts', 'nobody'].map((option) => (
            <button
              key={option}
              onClick={() => handleUpdatePrivacy('allowMessagesFrom', option)}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between',
                privacy.allowMessagesFrom === option
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary'
              )}
            >
              <span>
                {option === 'everyone' && t('privacy.everyone')}
                {option === 'contacts' && t('privacy.contacts')}
                {option === 'nobody' && t('privacy.nobody')}
              </span>
              {privacy.allowMessagesFrom === option && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">{t('privacy.whoCanCall')}</h4>
        <div className="space-y-2">
          {['everyone', 'contacts', 'nobody'].map((option) => (
            <button
              key={option}
              onClick={() => handleUpdatePrivacy('allowCallsFrom', option)}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between',
                privacy.allowCallsFrom === option
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary'
              )}
            >
              <span>
                {option === 'everyone' && t('privacy.everyone')}
                {option === 'contacts' && t('privacy.contacts')}
                {option === 'nobody' && t('privacy.nobody')}
              </span>
              {privacy.allowCallsFrom === option && <Check className="w-4 h-4" />}
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
        title={t('appearance.darkTheme')}
        description={t('appearance.darkTheme.desc')}
      >
        <Switch
          checked={isDarkMode}
          onCheckedChange={setIsDarkMode}
        />
      </SettingItem>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">{t('appearance.colorScheme')}</h4>
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
              onClick={() => setAccentColor(i)}
              className={cn(
                'w-10 h-10 rounded-full transition-transform hover:scale-110',
                accentColor === i && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">{t('appearance.fontSize')}</h4>
        <div className="flex items-center gap-4">
          <span className="text-xs">A</span>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xl">A</span>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">{fontSize}px</p>
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
            <h4 className="font-medium">{t('devices.current')}</h4>
            <p className="text-xs text-muted-foreground">Chrome · Windows</p>
          </div>
          <span className="text-xs text-green-500">{t('devices.active')}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('devices.lastActivity')}: {t('common.now')}
        </p>
      </div>

      <Button variant="outline" className="w-full">
        {t('devices.terminateAll')}
      </Button>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={cn(
            'w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between',
            language === lang.code ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
          )}
        >
          <span>{lang.native}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{lang.name}</span>
            {language === lang.code && <Check className="w-4 h-4" />}
          </div>
        </button>
      ))}
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-secondary/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm">{t('storage.used')}</span>
          <span className="text-sm font-medium">256 МБ / 5 ГБ</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-[5%] bg-primary rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>{t('storage.photos')}</span>
          <span className="text-muted-foreground">128 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>{t('storage.videos')}</span>
          <span className="text-muted-foreground">64 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>{t('storage.documents')}</span>
          <span className="text-muted-foreground">32 МБ</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span>{t('storage.voice')}</span>
          <span className="text-muted-foreground">32 МБ</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full text-destructive hover:bg-destructive/10"
        onClick={handleClearCache}
      >
        {t('storage.clearCache')}
      </Button>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-4">
      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">{t('help.faq')}</h4>
        <p className="text-sm text-muted-foreground">{t('help.faq.desc')}</p>
      </button>

      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">{t('help.support')}</h4>
        <p className="text-sm text-muted-foreground">{t('help.support.desc')}</p>
      </button>

      <button className="w-full p-4 rounded-xl bg-secondary/50 text-left hover:bg-secondary/70 transition-colors">
        <h4 className="font-medium mb-1">{t('help.privacy')}</h4>
        <p className="text-sm text-muted-foreground">{t('help.privacy.desc')}</p>
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
          {t('profile.changePicture')}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">{t('profile.name')}</label>
          <p className="font-medium">{profile?.display_name || t('profile.notSpecified')}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">{t('profile.username')}</label>
          <p className="font-medium">@{profile?.username || t('profile.notSpecified')}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <label className="text-xs text-muted-foreground">{t('profile.bio')}</label>
          <p className="font-medium">{profile?.bio || t('profile.notSpecified')}</p>
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
        {t('profile.edit')}
      </Button>
    </div>
  );

  const getSectionTitle = () => {
    const titles: Record<SettingsSection, string> = {
      main: t('settings.title'),
      profile: t('settings.profile'),
      notifications: t('settings.notifications'),
      privacy: t('settings.privacy'),
      appearance: t('settings.appearance'),
      devices: t('settings.devices'),
      language: t('settings.language'),
      storage: t('settings.storage'),
      help: t('settings.help'),
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

          {/* Support Dialog */}
          <SupportDialog 
            isOpen={showSupportDialog} 
            onClose={() => setShowSupportDialog(false)} 
          />
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
