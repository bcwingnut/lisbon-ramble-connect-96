import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, isPersonalChat } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calling Gemini API for travel suggestions...');

    // Fetch recent chat history from the sender
    const { data: recentMessages } = await supabase
      .from('messages')
      .select(`
        content,
        created_at,
        profiles!messages_user_id_fkey (
          username
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Build context from recent messages
    const chatContext = recentMessages && recentMessages.length > 0 
      ? `\n\nRecent messages from this user:\n${recentMessages.reverse().map((msg: any) => `- ${msg.content}`).join('\n')}`
      : '';

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful travel assistant specializing in Lisbon, Portugal.

User's current message: "${message}"

${chatContext}

Please respond in clear, well-structured GitHub-flavored Markdown:
- Start with a concise title (##)
- Use short sections with bullet points
- Bold key place names and important tips
- Include practical details (best time, how to get there, price ranges) when helpful
- **IMPORTANT: Include real, working URLs to restaurant websites, attraction sites, and experience booking pages whenever possible**
- Format links as: [Place Name](https://actual-website-url.com)
- Keep it friendly and under 200 words`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    // If this is a personal chat, return the response directly
    if (isPersonalChat) {
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      .insert([{ content: `🤖 AI: ${aiResponse}`, user_id: botUserId! }]);

    if (insertError) {
      console.error('Error inserting AI response:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-travel-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});