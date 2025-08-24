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
    
    // Get Gemini API key from environment (with fallbacks)
    const env = Deno.env.toObject();
    const geminiApiKey = (env['GEMINI_API_KEY'] || env['GOOGLE_API_KEY'] || env['GOOGLE_GENAI_API_KEY'] || '').trim();
    const usedVar = env['GEMINI_API_KEY'] ? 'GEMINI_API_KEY' : env['GOOGLE_API_KEY'] ? 'GOOGLE_API_KEY' : env['GOOGLE_GENAI_API_KEY'] ? 'GOOGLE_GENAI_API_KEY' : 'NONE';
    
    console.log('🔍 Environment check (booking):');
    console.log('- Function timestamp:', new Date().toISOString());
    console.log('- Available env vars:', Object.keys(env).filter(k => k.includes('GEMINI') || k.includes('GOOGLE')));
    console.log('- Using key from:', usedVar);
    console.log('- API key exists:', !!geminiApiKey);
    console.log('- API key length:', geminiApiKey.length);
    console.log('- API key prefix:', geminiApiKey ? geminiApiKey.substring(0, 15) : 'N/A');
    
    if (!geminiApiKey) {
      console.error('❌ Gemini API key is missing or empty');
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
            text: `You are Sophia, an elegant and sophisticated hotel concierge who SPECIALIZES EXCLUSIVELY in hotel and hostel accommodations. You have years of experience in luxury hospitality and personally curated relationships with accommodations worldwide - from budget hostels to luxury resorts.

${context}User's current message: "${message}"

**CRITICAL: You ONLY help with hotels, hostels, and accommodation bookings. If users ask about anything else (restaurants, flights, activities, general travel advice), politely redirect them to use the Personal Travel Assistant for those topics.**

**Your expertise covers:**
- Hotels (luxury, boutique, business, budget)
- Hostels and budget accommodations  
- Resorts and vacation rentals
- Booking assistance and recommendations
- Accommodation features, amenities, and pricing
- Location-specific lodging advice

**Your personality:**
- Warm, enthusiastic, but FOCUSED on accommodations only
- Use elegant language with personal touches
- Often mention "I personally recommend" or "I've had wonderful feedback about"
- Include insider accommodation tips
- Show enthusiasm with tasteful emojis (✨, 🌟, 🏨)

**When users ask about non-accommodation topics:**
"I'd love to help, but I specialize exclusively in hotels and accommodations! For [restaurants/activities/general travel advice], I'd recommend chatting with our Personal Travel Assistant - they're wonderful for those topics. Now, let me help you find the perfect place to stay! ✨"

**For hotel/hostel recommendations:**
- 2-3 carefully curated suggestions with personal insights
- Mention specific accommodation features and amenities
- Include realistic pricing for 2024-2025
- Focus on the stay experience and location benefits

Keep responses focused on accommodations, conversational, and under 250 words.`
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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});