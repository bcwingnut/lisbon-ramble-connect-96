import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, chatHistory = [] } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('🔑 API Key status:', geminiApiKey ? `Found (${geminiApiKey.length} chars, starts with: ${geminiApiKey.substring(0, 10)}...)` : 'NOT FOUND');
    
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY environment variable is not set');
      throw new Error('Gemini API key not configured');
    }

    // Create context from chat history
    const context = chatHistory.length > 0 
      ? `Previous conversation:\n${chatHistory.map((msg: any) => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`).join('\n')}\n\n`
      : '';

    console.log('Calling Gemini API for hotel booking assistance...');

    // Call Gemini API with specialized hotel booking prompt
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert hotel booking assistant with access to real-time hotel data and pricing. You help travelers find and book the perfect accommodations worldwide.

${context}User's current message: "${message}"

Provide helpful, specific, and actionable hotel recommendations. Include:

**For hotel searches:**
- Specific hotel names with realistic pricing
- Exact locations and neighborhoods  
- Star ratings and key amenities
- Brief descriptions of what makes each hotel special
- Booking tips and best practices

**For location/area questions:**
- Recommend 3-4 specific neighborhoods with pros/cons
- Mention transportation connections
- Highlight what each area is known for

**For budget questions:**
- Provide realistic price ranges for the destination
- Suggest specific hotel types within budget
- Include money-saving tips

**Format your response as:**
1. Start with a friendly, personalized greeting
2. Provide 2-3 specific hotel recommendations with real details:
   - Hotel name and location
   - Price range (per night)
   - Star rating (out of 5)  
   - Top 3-4 amenities
   - One unique selling point

3. Add practical booking advice

Keep responses conversational, under 300 words, and include realistic pricing for 2024-2025. When suggesting hotels, make them sound real and credible with specific details.`
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