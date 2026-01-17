import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Notification sound
const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+LhHd0anJ9io6Gfnt5fYOIiIZ/fX2Ag4aHhX99fH6Bg4WFg399fH6Ag4SEg399fX+Bg4SDgn9+fn+BgoOCgH9+f4CBgoKBgH5+f4CBgYGAgH5/f4CBgYCAgH9/f4CAgYCAgH9/f4CAgICAgH9/gICAgICAgH9/gICAgICAgH9/gICAgIB/gH9/gICAgIB/gH+AgICAgH+Af4CAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgH+AgICAgICAgH+AgICAgH+AgICAgICAf4CAgICAf4CAgICAgIB/gICAgIB/gICAgICAgH+AgICAgH+AgICAgICAf4CAgICAgICAgICAgICAf4CAgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICA');

interface NotificationSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export function useNotifications() {
  const { user, profile } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    notificationsEnabled: true,
  });

  // Load settings from profile
  useEffect(() => {
    if (profile) {
      setSettings({
        soundEnabled: profile.sound_enabled ?? true,
        notificationsEnabled: profile.notifications_enabled ?? true,
      });
    }
  }, [profile]);

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const playSound = useCallback(() => {
    if (settings.soundEnabled) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {});
    }
  }, [settings.soundEnabled]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!settings.notificationsEnabled) return;
    
    playSound();

    if (permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [permission, settings.notificationsEnabled, playSound]);

  const notifyNewMessage = useCallback((senderName: string, content: string, chatName?: string) => {
    showNotification(chatName ? `${senderName} в ${chatName}` : senderName, {
      body: content.length > 50 ? content.slice(0, 50) + '...' : content,
      tag: 'new-message',
    });
  }, [showNotification]);

  const notifyIncomingCall = useCallback((callerName: string, isVideo: boolean) => {
    showNotification(`Входящий ${isVideo ? 'видео' : 'аудио'} звонок`, {
      body: `${callerName} звонит вам`,
      tag: 'incoming-call',
      requireInteraction: true,
    });
  }, [showNotification]);

  // Subscribe to new messages for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Don't notify for own messages
          if (message.sender_id === user.id) return;
          
          // Check if user is member of this chat
          const { data: membership } = await supabase
            .from('chat_members')
            .select('*, chat:chats(*)')
            .eq('chat_id', message.chat_id)
            .eq('user_id', user.id)
            .single();
          
          if (!membership) return;
          
          // Check if notifications are enabled for this chat
          if (membership.is_muted) return;
          
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', message.sender_id)
            .single();
          
          const senderName = sender?.display_name || sender?.username || 'Пользователь';
          const chatName = membership.chat?.type !== 'private' ? membership.chat?.name : undefined;
          
          notifyNewMessage(senderName, message.content || 'Медиа сообщение', chatName);
          
          // Increment unread count
          await supabase
            .from('chat_members')
            .update({ unread_count: (membership.unread_count || 0) + 1 })
            .eq('id', membership.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notifyNewMessage]);

  return {
    permission,
    settings,
    requestPermission,
    showNotification,
    notifyNewMessage,
    notifyIncomingCall,
    playSound,
  };
}
