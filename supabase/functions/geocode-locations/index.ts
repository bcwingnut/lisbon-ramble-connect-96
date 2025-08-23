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

    console.log('Locations to geocode:', locations)

    for (const locationName of locations.slice(0, 10)) { // Limit to 10 locations
      try {
        console.log(`Geocoding: ${locationName}`)
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=country,region,place,locality,neighborhood,address`
        )
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Geocoding result for ${locationName}:`, data.features?.[0])
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0]
            
            // Use the proper place name from Mapbox, including country context
            let displayName = feature.place_name || feature.text || locationName
            
            // If it's just a city name, add country for clarity
            if (feature.context) {
              const country = feature.context.find((c: any) => c.id?.startsWith('country'))?.text
              if (country && !displayName.includes(country)) {
                displayName = `${feature.text}, ${country}`
              }
            }
            
            geocodedLocations.push({
              name: displayName,
              coordinates: feature.center
            })
            
            console.log(`Successfully geocoded ${locationName} -> ${displayName}`)
          } else {
            console.log(`No results found for: ${locationName}`)
          }
        } else {
          console.error(`Geocoding API error for ${locationName}:`, response.status, response.statusText)
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