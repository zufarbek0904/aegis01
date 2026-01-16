export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type PresenceStatus = 'online' | 'recently' | 'offline' | 'invisible';

export type ActivityType = 
  | 'typing' 
  | 'recording_voice' 
  | 'recording_video' 
  | 'choosing_photo' 
  | 'sending_music' 
  | 'attaching_file' 
  | 'sending_location'
  | null;

export type MessageType = 'text' | 'photo' | 'video' | 'voice' | 'video_message' | 'file' | 'music' | 'location';

export interface User {
  id: string;
  name: string;
  avatar: string;
  presence: PresenceStatus;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  isOutgoing: boolean;
  replyTo?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  forwardedFrom?: {
    id: string;
    senderName: string;
  };
  mediaUrl?: string;
  duration?: number;
  isOneTime?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  scheduledFor?: Date;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  activity?: {
    userId: string;
    type: ActivityType;
  };
}

export interface SendStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
}
