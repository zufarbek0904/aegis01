import { Chat, Message, User } from '@/types/messenger';

export const currentUser: User = {
  id: 'me',
  name: 'Вы',
  avatar: '',
  presence: 'online',
};

export const mockUsers: User[] = [
  { id: '1', name: 'Алексей Петров', avatar: '', presence: 'online' },
];

export const mockChats: Chat[] = [
  {
    id: 'chat1',
    name: 'Алексей Петров',
    avatar: '',
    isGroup: false,
    participants: [mockUsers[0]],
    lastMessage: {
      id: 'm1',
      senderId: '1',
      content: 'Привет! Как дела с проектом?',
      type: 'text',
      status: 'read',
      timestamp: new Date(Date.now() - 300000),
      isOutgoing: false,
    },
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    activity: { userId: '1', type: 'typing' },
  },
];

export const mockMessages: Record<string, Message[]> = {
  chat1: [
    {
      id: 'msg1',
      senderId: '1',
      content: 'Привет! 👋',
      type: 'text',
      status: 'read',
      timestamp: new Date(Date.now() - 600000),
      isOutgoing: false,
    },
    {
      id: 'msg2',
      senderId: 'me',
      content: 'Привет! Как дела?',
      type: 'text',
      status: 'read',
      timestamp: new Date(Date.now() - 590000),
      isOutgoing: true,
    },
    {
      id: 'msg3',
      senderId: '1',
      content: 'Отлично! Работаю над новым проектом.',
      type: 'text',
      status: 'read',
      timestamp: new Date(Date.now() - 580000),
      isOutgoing: false,
    },
    {
      id: 'msg10',
      senderId: '1',
      content: 'Привет! Как дела с проектом?',
      type: 'text',
      status: 'read',
      timestamp: new Date(Date.now() - 300000),
      isOutgoing: false,
    },
  ],
};

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
