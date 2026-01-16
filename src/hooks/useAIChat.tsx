import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('ai-chat', {
        body: { 
          message,
          conversationHistory,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI service error');
      }

      const aiResponse = response.data?.response || 'Извините, произошла ошибка.';
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse },
      ]);

      return aiResponse;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [conversationHistory]);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    sendMessage,
    loading,
    conversationHistory,
    clearHistory,
  };
}
