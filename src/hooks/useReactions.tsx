import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
  users: string[];
}

interface MessageReactions {
  [messageId: string]: Reaction[];
}

export function useReactions(chatId: string | null) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReactions>({});
  const [loading, setLoading] = useState(false);

  // Fetch reactions for all messages in chat
  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length || !user) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;

      // Group reactions by message and emoji
      const grouped: MessageReactions = {};
      
      for (const reaction of data || []) {
        if (!grouped[reaction.message_id]) {
          grouped[reaction.message_id] = [];
        }
        
        const existing = grouped[reaction.message_id].find(r => r.emoji === reaction.emoji);
        if (existing) {
          existing.count++;
          existing.users.push(reaction.user_id);
          if (reaction.user_id === user.id) {
            existing.reacted = true;
          }
        } else {
          grouped[reaction.message_id].push({
            emoji: reaction.emoji,
            count: 1,
            reacted: reaction.user_id === user.id,
            users: [reaction.user_id],
          });
        }
      }

      setReactions(prev => ({ ...prev, ...grouped }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, [user]);

  // Toggle reaction on a message
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);

        setReactions(prev => {
          const messageReactions = prev[messageId] || [];
          const updated = messageReactions.map(r => {
            if (r.emoji === emoji) {
              return {
                ...r,
                count: r.count - 1,
                reacted: false,
                users: r.users.filter(u => u !== user.id),
              };
            }
            return r;
          }).filter(r => r.count > 0);
          
          return { ...prev, [messageId]: updated };
        });
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });

        setReactions(prev => {
          const messageReactions = prev[messageId] || [];
          const existing = messageReactions.find(r => r.emoji === emoji);
          
          if (existing) {
            return {
              ...prev,
              [messageId]: messageReactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, reacted: true, users: [...r.users, user.id] }
                  : r
              ),
            };
          }
          
          return {
            ...prev,
            [messageId]: [...messageReactions, { emoji, count: 1, reacted: true, users: [user.id] }],
          };
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  }, [user]);

  // Subscribe to reaction changes
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`reactions-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        async (payload) => {
          // Refetch reactions for affected message
          const messageId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
          if (messageId) {
            await fetchReactions([messageId]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchReactions]);

  return {
    reactions,
    fetchReactions,
    toggleReaction,
    loading,
  };
}
