import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatWithDetails {
  id: string;
  type: string;
  name: string | null;
  avatar_url: string | null;
  created_by: string | null;
  created_at: string;
  members: any[];
  lastMessage?: any;
  unreadCount: number;
  typingUsers: string[];
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data: memberships } = await supabase
      .from('chat_members')
      .select('*, chat:chats(*)')
      .eq('user_id', user.id);

    if (!memberships) {
      setLoading(false);
      return;
    }

    const chatDetails = await Promise.all(
      memberships.map(async (membership: any) => {
        const chat = membership.chat;

        const { data: members } = await supabase
          .from('chat_members')
          .select('*')
          .eq('chat_id', chat.id);

        const memberProfiles = await Promise.all(
          (members || []).map(async (m: any) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', m.user_id)
              .single();
            return { ...m, profile };
          })
        );

        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...chat,
          members: memberProfiles,
          lastMessage: messages?.[0],
          unreadCount: membership.unread_count || 0,
          typingUsers: [],
        };
      })
    );

    setChats(chatDetails);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const createGroup = async (name: string, memberIds: string[], isChannel = false) => {
    if (!user) return null;

    // Use the secure RPC function that bypasses RLS
    const { data: chatId, error } = await supabase.rpc('create_group_chat', {
      p_user_id: user.id,
      p_name: name,
      p_type: isChannel ? 'channel' : 'group',
      p_description: null,
      p_is_public: false,
      p_member_ids: memberIds
    });

    if (error) {
      console.error('Error creating group:', error);
      return null;
    }

    await fetchChats();
    return { id: chatId };
  };

  const getOrCreatePrivateChat = async (otherUserId: string) => {
    if (!user) return null;
    const { data: chatId } = await supabase.rpc('get_or_create_private_chat', { p_user_id: user.id, p_other_user_id: otherUserId });
    await fetchChats();
    return chatId;
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;
    await supabase.from('chat_members').update({ unread_count: 0 }).eq('chat_id', chatId).eq('user_id', user.id);
    setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, unreadCount: 0 } : chat));
  };

  return { chats, loading, fetchChats, createGroup, getOrCreatePrivateChat, markAsRead };
}
