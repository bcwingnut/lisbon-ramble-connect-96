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
    const { message } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calling Gemini API for travel suggestions...');

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful travel assistant specializing in Lisbon, Portugal. A user in a Lisbon travel chat asked: "${message}". Provide helpful, specific travel suggestions for Lisbon including places to visit, local experiences, restaurants, or practical tips. Keep your response conversational and under 200 words.`
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