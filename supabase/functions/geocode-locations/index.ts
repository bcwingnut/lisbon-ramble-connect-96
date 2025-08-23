import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Location {
  name: string;
  coordinates: [number, number]; // [lng, lat]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { locations } = await req.json()
    
    if (!locations || !Array.isArray(locations)) {
      return new Response(JSON.stringify({ error: 'Invalid locations array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    if (!MAPBOX_TOKEN) {
      return new Response(JSON.stringify({ error: 'Mapbox token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const geocodedLocations: Location[] = []

    for (const locationName of locations.slice(0, 10)) { // Limit to 10 locations
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const feature = data.features[0]
            geocodedLocations.push({
              name: locationName,
              coordinates: feature.center
            })
          }
        }
      } catch (error) {
        console.error(`Failed to geocode ${locationName}:`, error)
      }
    }

    return new Response(JSON.stringify({ 
      locations: geocodedLocations,
      mapboxToken: MAPBOX_TOKEN 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})