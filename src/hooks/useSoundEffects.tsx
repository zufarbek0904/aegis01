import { useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

// Base64 encoded short beep sounds
const SEND_SOUND = 'data:audio/wav;base64,UklGRl9vT19teleXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU+vT19XQVZFZm10IBAAAAABAAEAQB8AAEA=';
const RECEIVE_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+LhHd0anJ9io6Gfnt5fYOIiIZ/fX2Ag4aHhX99fH6Bg4WFg399fH6Ag4SEg399fX+Bg4SDgn9+fn+BgoOCgH9+f4CBgoKBgH5+f4CBgYGAgH5/f4CBgYCAgH9/f4CAgYCAgH9/f4CAgICAgH9/gICAgICAgH9/gICAgIB/gH9/gICAgIB/gH+AgICAgH+Af4CAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgH+AgICAgICAgH+AgICAgH+AgICAgICAf4CAgICAf4CAgICAgIB/gICAgIB/gICAgICAgH+AgICAgH+AgICAgICAf4CAgICAgICAgICAgICAf4CAgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICA';
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+LhHd0anJ9io6Gfnt5fYOIiIZ/fX2Ag4aHhX99fH6Bg4WFg399fH6Ag4SEg399fX+Bg4SDgn9+fn+BgoOCgH9+f4CBgoKBgH5+f4CBgYGAgH5/f4CBgYCAgH9/f4CAgYCAgH9/f4CAgICAgH9/gICAgICAgH9/gICAgIB/gH9/gICAgIB/gH+AgICAgH+Af4CAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgICAf4CAgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgIB/gICAgICAgH+AgICAgH+AgICAgICAgH+AgICAgH+AgICAgICAf4CAgICAf4CAgICAgIB/gICAgIB/gICAgICAgH+AgICAgH+AgICAgICAf4CAgICAgICAgICAgICAf4CAgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAf4CAgICAgICAgICAgH+AgICAgICAgICAgIB/gICAgICAgICAgICAgH+AgICAgICAgICAgIB/gICA';

export function useSoundEffects() {
  const { profile } = useAuth();
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const receiveAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  const isSoundEnabled = profile?.sound_enabled ?? true;

  const playSendSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    if (!sendAudioRef.current) {
      sendAudioRef.current = new Audio(SEND_SOUND);
      sendAudioRef.current.volume = 0.5;
    }
    sendAudioRef.current.currentTime = 0;
    sendAudioRef.current.play().catch(() => {});
  }, [isSoundEnabled]);

  const playReceiveSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    if (!receiveAudioRef.current) {
      receiveAudioRef.current = new Audio(RECEIVE_SOUND);
      receiveAudioRef.current.volume = 0.5;
    }
    receiveAudioRef.current.currentTime = 0;
    receiveAudioRef.current.play().catch(() => {});
  }, [isSoundEnabled]);

  const playNotificationSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    if (!notificationAudioRef.current) {
      notificationAudioRef.current = new Audio(NOTIFICATION_SOUND);
      notificationAudioRef.current.volume = 0.7;
    }
    notificationAudioRef.current.currentTime = 0;
    notificationAudioRef.current.play().catch(() => {});
  }, [isSoundEnabled]);

  return {
    playSendSound,
    playReceiveSound,
    playNotificationSound,
  };
}
