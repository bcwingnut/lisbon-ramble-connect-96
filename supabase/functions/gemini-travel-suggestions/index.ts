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
    
    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('🔍 Travel Assistant Environment check:');
    console.log('- Function timestamp:', new Date().toISOString());
    console.log('- Available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.includes('GEMINI')));
    console.log('- GEMINI_API_KEY exists:', !!geminiApiKey);
    console.log('- GEMINI_API_KEY length:', geminiApiKey?.length || 0);
    console.log('- GEMINI_API_KEY prefix:', geminiApiKey?.substring(0, 15) || 'N/A');
    
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      console.error('❌ GEMINI_API_KEY is missing or empty');
      throw new Error('Gemini API key not configured');
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calling Gemini API for travel suggestions...');

    let prompt;
    
    if (isPersonalChat) {
      // Create context from chat history for personal chat
      const context = chatHistory.length > 0 
        ? `Previous conversation:\n${chatHistory.map((msg: any) => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`).join('\n')}\n\n`
        : '';

      prompt = `You are a friendly, enthusiastic travel companion who loves chatting about all things travel-related. You're knowledgeable, curious, and genuinely interested in travel experiences, cultures, and destinations worldwide.

${context}Current user message: "${message}"

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
    } else {
      // Location-based chat prompt
      prompt = `You are a helpful travel assistant that provides personalized travel advice for destinations worldwide.\n\nUser's message: "${message}"\n\nRespond with helpful travel recommendations, tips, or information based on their request. You can provide advice about any destination, activity, or travel-related topic.\n\nRespond in clear, well-structured GitHub-flavored Markdown:\n- Start with a concise title (##) when appropriate\n- Use short sections with bullet points\n- Bold key place names and important tips\n- Include practical details (best time to visit, how to get there, price ranges) when helpful\n- Include real, working URLs to official sites and booking pages when possible\n- Format links as: [Place Name](https://actual-website-url.com)\n- Keep it friendly and conversational\n- If they ask about a specific destination, provide detailed local insights\n- If they ask general travel questions, provide comprehensive advice\n- Maximum 400 words`;
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

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt + (isPersonalChat ? '' : chatContext)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('No response from Gemini API, full response:', JSON.stringify(data));
      throw new Error('No response from Gemini API');
    }

    console.log('✅ Successfully got response from Gemini API');

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

    console.log('Gemini response received, inserting as message...');

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