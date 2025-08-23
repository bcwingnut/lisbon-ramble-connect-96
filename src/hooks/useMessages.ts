import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
  };
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_user_id_fkey (
                username
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (content: string, userId: string) => {
    const { error } = await supabase
      .from('messages')
      .insert([{ content, user_id: userId }]);

    if (error) {
      console.error('Error sending message:', error);
      return false;
    }

    // Check if message mentions @ai anywhere to trigger Gemini response
    const aiMention = /(^|\s)@ai(\s|$)/i.test(content);
    if (aiMention) {
      const cleaned = content.replace(/@ai/ig, '').trim();
      try {
        const { error: aiError } = await supabase.functions.invoke('gemini-travel-suggestions', {
          body: { 
            message: cleaned || 'Give me travel suggestions',
            userId: userId
          }
        });
        
        if (aiError) {
          console.error('Error calling Gemini function:', aiError);
        }
      } catch (error) {
        console.error('Error invoking Gemini function:', error);
      }
    }

    return true;
  };

  return {
    messages,
    loading,
    sendMessage
  };
};