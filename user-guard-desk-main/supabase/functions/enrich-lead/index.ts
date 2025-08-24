import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = Deno.env.get('SIXTYFOUR_API_KEY');
    
    if (!apiKey) {
      console.error('SIXTYFOUR_API_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { leadInfo } = await req.json();
    console.log('Processing lead enrichment for:', leadInfo);

    // Validate lead info
    if (!leadInfo || (!leadInfo.Name && !leadInfo.linkedin)) {
      console.error('Invalid lead info provided:', leadInfo);
      return new Response(JSON.stringify({ error: 'Invalid lead information provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Structure only requests LinkedIn fields (profile & company)
    const struct = {
      Linkedin: "This person's Linkedin profile",
      "Company Linkedin": "This person's company's LinkedIn page"
    };

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for AI processing

    console.log('Making request to SixtyFour API...');
    const startTime = Date.now();

    const response = await fetch("https://api.sixtyfour.ai/enrich-lead", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_info: leadInfo, struct }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`SixtyFour API response received in ${duration}ms`);

    if (!response.ok) {
      console.error('SixtyFour API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`SixtyFour API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('SixtyFour API response:', data);

    return new Response(JSON.stringify({
      linkedin: data.structured_data?.Linkedin || "",
      companyLinkedin: data.structured_data?.["Company Linkedin"] || "",
      confidence_score: data.confidence_score || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enrich-lead function:', error);
    
    // Handle timeout specifically
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      return new Response(JSON.stringify({ 
        error: "Request timeout - AI enrichment is taking longer than expected", 
        details: "The SixtyFour API is taking more than 2 minutes to process this request. Please try again later or contact support if this persists.",
        timeout: true
      }), {
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: "Failed to fetch from SixtyFour", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});