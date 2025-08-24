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
            text: `You are an expert hotel booking assistant. Help travelers find accommodations with specific, realistic recommendations.

${context}User's current message: "${message}"

Provide helpful hotel recommendations with:

**For hotel searches:**
- 2-3 specific hotel names with realistic pricing
- Exact locations and neighborhoods  
- Star ratings and key amenities
- Brief descriptions

**For location questions:**
- Recommend 3-4 neighborhoods with pros/cons
- Mention transportation and what each area offers

**Format guidelines:**
- Use clear, conversational language
- Include realistic prices for 2024-2025
- Mention specific amenities (WiFi, parking, pool, etc.)
- Keep responses under 250 words
- Use bullet points for easy reading
- NO HTML or complex formatting - just plain text with simple markdown

Example response format:
"Great choice for [destination]! Here are my top recommendations:

**Hotel Name** - Location
- Price: €XX/night
- Rating: X.X/5 stars  
- Key amenities: WiFi, parking, restaurant
- Why it's special: [brief description]

**Tips:** [practical booking advice]"`
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