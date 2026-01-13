import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageWithSender {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  type: string;
  status: string;
  media_url: string | null;
  media_duration: number | null;
  is_one_time: boolean | null;
  reply_to_id: string | null;
  is_edited: boolean | null;
  is_deleted: boolean | null;
  created_at: string;
  sender: any;
}

export function useMessages(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!chatId) { setMessages([]); setLoading(false); return; }

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!data) return;

    const messagesWithSenders = await Promise.all(
      data.map(async (msg) => {
        const { data: sender } = await supabase.from('profiles').select('*').eq('id', msg.sender_id).single();
        return { ...msg, sender };
      })
    );

    setMessages(messagesWithSenders);
    setLoading(false);
  }, [chatId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!chatId) return;
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const newMessage = payload.new as any;
          const { data: sender } = await supabase.from('profiles').select('*').eq('id', newMessage.sender_id).single();
          setMessages(prev => [...prev, { ...newMessage, sender }]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  const sendMessage = async (content: string, options?: { type?: string; mediaUrl?: string; isOneTime?: boolean; scheduledFor?: Date }) => {
    if (!user || !chatId) return null;

    if (options?.scheduledFor) {
      const messageType = (options.type || 'text') as 'text' | 'photo' | 'video' | 'voice' | 'video_message' | 'file' | 'music' | 'location';
      const { data } = await supabase.from('scheduled_messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
        type: messageType,
        media_url: options.mediaUrl || null,
        scheduled_for: options.scheduledFor.toISOString(),
      }).select().single();
      return data;
    }

    const messageType = (options?.type || 'text') as 'text' | 'photo' | 'video' | 'voice' | 'video_message' | 'file' | 'music' | 'location';
    const messageStatus = 'sent' as 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    
    const { data } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      content,
      type: messageType,
      media_url: options?.mediaUrl || null,
      is_one_time: options?.isOneTime || false,
      status: messageStatus,
    }).select().single();

    return data;
  };

  const setTyping = async (activityType = 'typing') => {
    if (!user || !chatId) return;
    await supabase.from('typing_indicators').upsert({ chat_id: chatId, user_id: user.id, activity_type: activityType });
    setTimeout(async () => { await supabase.from('typing_indicators').delete().eq('chat_id', chatId).eq('user_id', user.id); }, 3000);
  };

  return { messages, loading, sendMessage, setTyping, refetch: fetchMessages };
}
