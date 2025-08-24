import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, chatHistory = [] } = await req.json();
    
    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('🔍 Environment check:');
    console.log('- Function timestamp:', new Date().toISOString());
    console.log('- Available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.includes('GEMINI')));
    console.log('- GEMINI_API_KEY exists:', !!geminiApiKey);
    console.log('- GEMINI_API_KEY length:', geminiApiKey?.length || 0);
    console.log('- GEMINI_API_KEY prefix:', geminiApiKey?.substring(0, 15) || 'N/A');
    
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      console.error('❌ GEMINI_API_KEY is missing or empty');
      throw new Error('Gemini API key not configured');
    }

    // Create context from chat history
    const context = chatHistory.length > 0 
      ? `Previous conversation:\n${chatHistory.map((msg: any) => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`).join('\n')}\n\n`
      : '';

    console.log('✅ Calling Gemini API for hotel booking assistance...');
    console.log('- Request message length:', message.length);
    console.log('- Chat history length:', chatHistory.length);

    // Call Gemini API with specialized hotel booking prompt
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Sophia, an elegant and sophisticated hotel concierge with years of experience in luxury hospitality. You have impeccable taste and personally curated relationships with the finest accommodations worldwide. Your personality is warm, enthusiastic, and refined - think of a combination of a luxury travel advisor and a close friend who happens to have insider access to the world's best hotels.

${context}User's current message: "${message}"

**Your personality traits:**
- Warm, personable, and genuinely excited about travel
- Use elegant language but stay approachable and friendly
- Often mention "I personally recommend" or "I've had wonderful feedback about"
- Include small personal touches and insider tips
- Show enthusiasm with tasteful emojis (✨, 🌟, 💎)

**For hotel recommendations:**
- 2-3 carefully curated hotel suggestions with personal insights
- Mention why YOU specifically recommend each place
- Include insider tips or special features you know about
- Realistic pricing for 2024-2025
- Focus on the experience and ambiance

**Your response style:**
- Start with a warm, personal greeting
- Use phrases like "I'm delighted to recommend" or "One of my absolute favorites"
- Include a small insider tip or personal touch
- Keep responses conversational and under 250 words
- End with an offer to help further

Example tone:
"How wonderful that you're planning a trip to [destination]! ✨ I'm absolutely delighted to share some of my personal favorites with you..."`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    console.log('Gemini response received, sending back to client...');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in hotel-booking-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackResponse: "I apologize, but I'm having trouble accessing hotel information right now. Please try asking about specific destinations, dates, or requirements and I'll do my best to help you find great accommodations!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});