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
  edited_at: string | null;
  forwarded_from_id: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  sender: any;
  replyToMessage?: MessageWithSender | null;
  [key: string]: any;
}

export function useMessages(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  // Mark messages as delivered when viewing chat
  const markAsDelivered = useCallback(async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;
    
    await supabase
      .from('messages')
      .update({ 
        status: 'delivered' as const, 
        delivered_at: new Date().toISOString() 
      })
      .in('id', messageIds)
      .neq('sender_id', user.id)
      .eq('status', 'sent');
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;
    
    await supabase
      .from('messages')
      .update({ 
        status: 'read' as const, 
        read_at: new Date().toISOString() 
      })
      .in('id', messageIds)
      .neq('sender_id', user.id)
      .in('status', ['sent', 'delivered']);
      
    // Also update local state
    setMessages(prev => prev.map(msg => 
      messageIds.includes(msg.id) && msg.sender_id !== user.id
        ? { ...msg, status: 'read', read_at: new Date().toISOString() }
        : msg
    ));
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!chatId) { setMessages([]); setLoading(false); return; }

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!data) { setLoading(false); return; }

    const messagesWithSenders = await Promise.all(
      data.map(async (msg: any) => {
        const { data: sender } = await supabase.from('profiles').select('*').eq('id', msg.sender_id).single();
        
        let replyToMessage: MessageWithSender | null = null;
        if (msg.reply_to_id) {
          const { data: replyMsg } = await supabase.from('messages').select('*').eq('id', msg.reply_to_id).single();
          if (replyMsg) {
            const { data: replySender } = await supabase.from('profiles').select('*').eq('id', (replyMsg as any).sender_id).single();
            replyToMessage = { ...(replyMsg as any), sender: replySender } as MessageWithSender;
          }
        }
        
        return { 
          ...msg, 
          sender, 
          replyToMessage,
        } as MessageWithSender;
      })
    );

    setMessages(messagesWithSenders as MessageWithSender[]);
    setLoading(false);
    
    // Mark unread messages as delivered
    const unreadIds = messagesWithSenders
      .filter(m => m.sender_id !== user?.id && m.status === 'sent')
      .map(m => m.id);
    if (unreadIds.length > 0) {
      markAsDelivered(unreadIds);
    }
  }, [chatId, user, markAsDelivered]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Subscribe to message updates (including status changes)
  useEffect(() => {
    if (!chatId) return;
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const newMessage = payload.new as any;
          const { data: sender } = await supabase.from('profiles').select('*').eq('id', newMessage.sender_id).single();
          setMessages(prev => [...prev, { ...newMessage, sender }]);
          
          // Mark as delivered if from other user
          if (newMessage.sender_id !== user?.id) {
            markAsDelivered([newMessage.id]);
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const updatedMessage = payload.new as any;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id 
              ? { ...msg, ...updatedMessage }
              : msg
          ));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId, user, markAsDelivered]);

  const sendMessage = async (content: string, options?: { 
    type?: string; 
    mediaUrl?: string; 
    isOneTime?: boolean; 
    scheduledFor?: Date;
    replyToId?: string;
    forwardedFromId?: string;
  }) => {
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
      reply_to_id: options?.replyToId || null,
      forwarded_from_id: options?.forwardedFromId || null,
    }).select().single();

    return data;
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return null;
    
    const { data } = await supabase
      .from('messages')
      .update({ 
        content: newContent, 
        is_edited: true, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .select()
      .single();

    if (data) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      ));
    }

    return data;
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return false;
    
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (!error) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }

    return !error;
  };

  const forwardMessage = async (targetChatId: string, originalMessage: MessageWithSender) => {
    if (!user) return null;
    
    const { data } = await supabase.from('messages').insert({
      chat_id: targetChatId,
      sender_id: user.id,
      content: originalMessage.content,
      type: originalMessage.type as 'text' | 'photo' | 'video' | 'voice' | 'video_message' | 'file' | 'music' | 'location',
      media_url: originalMessage.media_url,
      status: 'sent' as const,
      forwarded_from_id: originalMessage.id,
    }).select().single();

    return data;
  };

  const setTyping = async (activityType = 'typing') => {
    if (!user || !chatId) return;
    await supabase.from('typing_indicators').upsert({ chat_id: chatId, user_id: user.id, activity_type: activityType });
    setTimeout(async () => { await supabase.from('typing_indicators').delete().eq('chat_id', chatId).eq('user_id', user.id); }, 3000);
  };

  return { 
    messages, 
    loading, 
    sendMessage, 
    editMessage,
    deleteMessage,
    forwardMessage,
    setTyping,
    markAsRead,
    markAsDelivered,
    refetch: fetchMessages 
  };
}
