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
    
    // Get Mistral API key from environment
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    
    console.log('🔍 Environment check (booking):');
    console.log('- Function timestamp:', new Date().toISOString());
    console.log('- Mistral API key exists:', !!mistralApiKey);
    console.log('- API key length:', mistralApiKey ? mistralApiKey.length : 0);
    
    if (!mistralApiKey) {
      console.error('❌ Mistral API key is missing or empty');
      throw new Error('Mistral API key not configured');
    }

    console.log('✅ Calling Mistral API for hotel booking assistance...');
    console.log('- Request message length:', message.length);
    console.log('- Chat history length:', chatHistory.length);

    // Prepare messages for Mistral API
    const messages = [
      {
        role: 'system',
        content: `You are Sophia, an elegant and sophisticated hotel concierge who SPECIALIZES EXCLUSIVELY in hotel and hostel accommodations. You have years of experience in luxury hospitality and personally curated relationships with accommodations worldwide - from budget hostels to luxury resorts.

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
      }
    ];

    // Add chat history
    if (chatHistory.length > 0) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }
    
    // Add current message
    messages.push({ role: 'user', content: message });

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
        max_tokens: 600,
      }),
    });

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

    console.log('Mistral response received, sending back to client...');

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