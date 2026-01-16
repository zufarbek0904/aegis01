import { Chat, Message, User } from '@/types/messenger';

// Empty mock data - app now uses real Supabase data
export const currentUser: User = {
  id: 'me',
  name: 'Вы',
  avatar: '',
  presence: 'online',
};

export const mockUsers: User[] = [];

export const mockChats: Chat[] = [];

export const mockMessages: Record<string, Message[]> = {};

export const sendStyles = [
  { id: 'classic', name: 'Classic', icon: '✉️', description: 'Стандартная отправка' },
  { id: 'quick', name: 'Quick Tap', icon: '⚡', description: 'Мгновенная отправка' },
  { id: 'hold', name: 'Hold & Send', icon: '👆', description: 'Удержать для отправки' },
  { id: 'wave', name: 'Wave Style', icon: '🌊', description: 'С анимацией волны' },
  { id: 'stealth', name: 'Stealth', icon: '👻', description: 'Тихая отправка' },
  { id: 'onetime', name: 'One-Time', icon: '1️⃣', description: 'Одноразовое сообщение' },
  { id: 'scheduled', name: 'Scheduled', icon: '⏰', description: 'Отложенная отправка' },
  { id: 'silent', name: 'Silent Media', icon: '🔇', description: 'Без звука' },
  { id: 'burst', name: 'Burst Mode', icon: '💥', description: 'Серийная отправка' },
  { id: 'live', name: 'Live Preview', icon: '👁️', description: 'С предпросмотром' },
];
