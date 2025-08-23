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

export const useMessages = (location?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      let query = supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            username
          )
        `);
      
      if (location) {
        query = query.eq('location', location);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });

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
      .channel(`messages-${location || 'all'}`)
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
  }, [location]);

  const sendMessage = async (content: string, userId: string, messageLocation?: string) => {
    const messageData: any = { 
      content, 
      user_id: userId,
      location: messageLocation || location || 'lisbon'
    };
    
    const { error } = await supabase
      .from('messages')
      .insert([messageData]);

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
            userId: userId,
            location: messageLocation || location || 'lisbon'
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