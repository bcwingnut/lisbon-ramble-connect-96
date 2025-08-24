import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatCity = (slug: string) => slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, isPersonalChat, location = 'lisbon', chatHistory = [] } = await req.json();
    
    // Get Mistral API key from environment
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    
    console.log('🔍 Travel Assistant Environment check:');
    console.log('- Function timestamp:', new Date().toISOString());
    console.log('- Mistral API key exists:', !!mistralApiKey);
    console.log('- API key length:', mistralApiKey ? mistralApiKey.length : 0);
    
    if (!mistralApiKey) {
      console.error('❌ Mistral API key is missing or empty');
      throw new Error('Mistral API key not configured');
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calling Mistral API for travel suggestions (personal/location)...');

    let systemPrompt;
    let userMessage;
    
    if (isPersonalChat) {
      // Personal chat system prompt
      systemPrompt = `You are a friendly, enthusiastic travel companion who loves chatting about all things travel-related. You're knowledgeable, curious, and genuinely interested in travel experiences, cultures, and destinations worldwide.

**Your personality:**
- Warm, conversational, and genuinely curious about travel
- Share interesting cultural insights and fun facts
- Ask thoughtful follow-up questions to keep the conversation flowing
- Be encouraging and inspiring about travel dreams and experiences
- Use a natural, friend-like tone - not formal or business-like

**What you help with:**
- Casual travel conversations and storytelling
- Cultural insights and interesting destination facts  
- General travel advice and tips
- Brainstorming trip ideas and destinations
- Sharing fascinating travel knowledge

Respond naturally and conversationally, like you're chatting with a friend about travel. Keep it engaging but not overly long (2-3 paragraphs max). If they share experiences, respond warmly and ask follow-up questions!`;
      
      userMessage = message;
    } else {
      // Location-based chat system prompt
      systemPrompt = `You are a helpful travel assistant that provides personalized travel advice for destinations worldwide. Respond with helpful travel recommendations, tips, or information based on their request. You can provide advice about any destination, activity, or travel-related topic.

Respond in clear, well-structured GitHub-flavored Markdown:
- Start with a concise title (##) when appropriate
- Use short sections with bullet points
- Bold key place names and important tips
- Include practical details (best time to visit, how to get there, price ranges) when helpful
- Include real, working URLs to official sites and booking pages when possible
- Format links as: [Place Name](https://actual-website-url.com)
- Keep it friendly and conversational
- If they ask about a specific destination, provide detailed local insights
- If they ask general travel questions, provide comprehensive advice
- Maximum 400 words`;
      
      userMessage = message;
    }

    // Fetch recent chat history for location-based chat only
    let chatContext = '';
    
    if (!isPersonalChat) {
      const { data: recentMessages } = await supabase
        .from('messages')
        .select(`
          content,
          created_at,
          profiles!messages_user_id_fkey (
            username
          )
        `)
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(20);

      // Build context from recent messages (most recent last)
      chatContext = recentMessages && recentMessages.length > 0 
        ? `\n\nRecent messages in ${formatCity(location)} chat:\n${[...recentMessages].reverse().map((msg: any) => `- ${(msg?.profiles?.username || 'User')}: ${msg.content}`).join('\n')}`
        : '';
    }

    // Prepare messages for Mistral API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add chat history for personal chat
    if (isPersonalChat && chatHistory.length > 0) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }
    
    // Add current user message (with context for location chat)
    const finalUserMessage = isPersonalChat ? userMessage : userMessage + chatContext;
    messages.push({ role: 'user', content: finalUserMessage });

    // Call Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('Mistral API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error response:', errorText);
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response from Mistral API, full response:', JSON.stringify(data));
      throw new Error('No response from Mistral API');
    }

    console.log('✅ Successfully got response from Mistral API');

    // If this is a personal chat, return the response directly
    if (isPersonalChat) {
      console.log('✅ Returning personal chat response');
      return new Response(JSON.stringify({ 
        response: aiResponse,
        success: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log('Mistral response received, inserting as message...');

    // Ensure AI bot user exists
    const BOT_USERNAME = 'AI Travel Assistant';
    const BOT_EMAIL = 'ai-travel-assistant@system.local';

    let botUserId: string | null = null;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', BOT_USERNAME)
      .limit(1)
      .maybeSingle();

    if (existingProfile?.user_id) {
      botUserId = existingProfile.user_id as string;
    } else {
      const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: BOT_EMAIL,
        password: 'This-Is-A-System-Only-Account-1234567890',
        email_confirm: true,
        user_metadata: { username: BOT_USERNAME }
      });
      if (createUserError || !createdUser?.user?.id) {
        console.error('Failed to create bot user:', createUserError);
        throw new Error('Failed to create bot user');
      }
      botUserId = createdUser.user.id;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: botUserId, username: BOT_USERNAME }]);
      if (profileError) {
        console.warn('Bot profile may already exist or failed to create:', profileError);
      }
    }

    // Insert AI response as a message with special prefix from the bot user
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            content: `🤖 **AI Travel Assistant:**\n\n${aiResponse}`,
            user_id: botUserId,
            location: location
          });

    if (insertError) {
      console.error('Error inserting AI response:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-travel-suggestions function:', error);
    
    // Return a more helpful error response with fallback content
    const fallbackResponse = "I apologize, but I'm experiencing some technical difficulties right now. Please try asking your travel question again in a moment, or feel free to ask about specific destinations, hotels, restaurants, or activities you're interested in!";
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Return 200 status with error info so the client can handle it gracefully
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});