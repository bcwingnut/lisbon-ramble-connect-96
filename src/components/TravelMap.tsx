import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface Location {
  name: string;
  coordinates: [number, number]; // [lng, lat]
}

interface TravelMapProps {
  content: string;
}

const TravelMap = ({ content }: TravelMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Extract location names from content
  const extractLocations = (text: string): string[] => {
    const foundLocations = new Set<string>();
    
    // Extract specific place names (proper nouns and landmarks)
    const specificPlaces = [
      // Major world cities - explicit list for better matching
      /\b(London|Paris|Tokyo|New York|Rome|Barcelona|Amsterdam|Berlin|Vienna|Prague|Budapest|Venice|Florence|Madrid|Lisbon|Porto|Athens|Istanbul|Moscow|Dubai|Bangkok|Singapore|Hong Kong|Sydney|Melbourne|Toronto|Vancouver|Montreal|Los Angeles|San Francisco|Chicago|Las Vegas|Miami|Boston|Washington|Seattle|Portland|Denver|Austin|Nashville|New Orleans|Phoenix|San Diego|Orlando|Tampa|Detroit|Philadelphia|Atlanta|Dallas|Houston|Minneapolis|Pittsburgh|Cleveland|Cincinnati|Indianapolis|Milwaukee|Kansas City|St Louis|Salt Lake City|Albuquerque|Tucson|Sacramento|Beijing|Shanghai|Mumbai|Delhi|Bangalore|Chennai|Kolkata|Hyderabad|Pune|Ahmedabad|Surat|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Bhopal|Visakhapatnam|Pimpri-Chinchwad|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan-Dombivli|Vasai-Virar|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Howrah|Ranchi|Gwalior|Jabalpur|Coimbatore|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Solapur|Hubballi-Dharwad|Tiruchirappalli|Bareilly|Mysore|Tiruppur|Gurgaon|Aligarh|Jalandhar|Bhubaneswar|Salem|Warangal|Guntur|Bhiwandi|Saharanpur|Gorakhpur|Bikaner|Amravati|Noida|Jamshedpur|Bhilai Nagar|Cuttack|Firozabad|Kochi|Bhavnagar|Dehradun|Durgapur|Asansol|Nanded-Waghala|Malegaon|Jammu|Ajmer|Akola|Gulbarga|Jamnagar|Ujjain|Loni|Siliguri|Jhansi|Ulhasnagar|Nellore|Sangli-Miraj & Kupwad|Belgaum|Mangalore|Ambattur|Tirunelveli|Maheshtala|Davanagere|Kozhikode|Kurnool|Rajpur Sonarpur|Rajahmundry|Bokaro|South Dumdum|Bellary|Patiala|Gopalpur|Agartala|Bhagalpur|Muzaffarnagar|Bhatpara|Panihati|Latur|Dhule|Rohtak|Korba|Bhilwara|Berhampur|Muzaffarpur|Ahmednagar|Mathura|Kollam|Avadi|Kadapa|Kamarhati|Sambalpur|Bilaspur|Shahjahanpur|Satara|Bijapur|Rampur|Shivamogga|Chandrapur|Junagadh|Thrissur|Alwar|Bardhaman|Kulti|Nizamabad|Parbhani|Tumkur|Hisar|Ozhukarai|Bihar Sharif|Panipat|Darbhanga|Bally|Aizawl|Dewas|Ichalkaranji|Tirupati|Karnal|Bathinda|Jalna|Eluru|Kirari Suleman Nagar|Barasat|Purnia|Satna|Mau|Sonipat|Farrukhabad|Sagar|Rourkela|Durg|Imphal|Ratlam|Hapur|Arrah|Anantapur|Karimnagar|Etawah|Ambernath|North Dumdum|Bharatpur|Begusarai|New Delhi|Gandhidham|Baranagar|Tiruvottiyur|Puducherry|Sikar|Thoothukudi|Rewa|Mirzapur|Raichur|Pali|Ramagundam|Haridwar|Vijayanagaram|Katihar|Nagarcoil|Sri Ganganagar|Karawal Nagar|Mango|Thanjavur|Bulandshahr|Uluberia|Murwara|Sambhal|Singrauli|Nadiad|Secunderabad|Naihati|Yamunanagar|Bidhan Nagar|Pallavaram|Bidar|Munger|Panchkula|Burhanpur|Raurkela Industrial Township|Kharagpur|Dindigul|Gandhinagar|Hospet|Nangloi Jat|Malda|Ongole|Deoghar|Chapra|Haldia|Khandwa|Nandyal|Chittoor|Morena|Amroha|Anand|Bhind|Bhalswa Jahangir Pur|Madhyamgram|Bhiwani|Navi Mumbai Panvel Raigad|Baharampur|Ambala|Morbi|Fatehpur|Rae Bareli|Khora, Ghaziabad|Bhusawal|Orai|Bahraich|Vellore|Mahesana|Sambalpur|Raiganj|Sirsa|Danapur|Serampore|Sultan Pur Majra|Guna|Jaunpur|Panvel|Shivpuri|Surendranagar Dudhrej|Unnao|Hugli-Chinsurah|Alappuzha|Kottayam|Machilipatnam|Shimla|Adoni|Tenali|Proddatur|Saharsa|Hindupur|Sasaram|Hajipur|Bhimavaram|Dehri|Madanapalle|Siwan|Bettiah|Guntakal|Srikakulam|Motihari|Dharmavaram|Gudivada|Narasaraopet|Bagaha|Miryalaguda|Tadipatri|Kishanganj|Karaikudi|Suryapet|Jamalpur|Kavali|Tadepalligudem|Amaravati|Buxar|Jehanabad|Aurangabad|Alappuzha|Shivamogga|Ratlam|Moradabad|Nandyal|Bhalswa Jahangir Pur|Ramagundam|Kanpur Nagar|Nadiad|Kakinada|Kochi|Thanesar|Erode|Imphal East|Bhavnagar|Chinakakani|Badlapur|Alandur|Bidhannagar|Thanjavur|Sri Ganganagar|Kamarhati|Saharsa|Kottayam|New Delhi|Begusarai|Uppal Kalan|Palakonda|Bokaro Steel City|Surendranagar Dudhrej|Guntakal|Srikakulam|Pallavaram|Tiruppur|Adoni|Sambalpur|Bardhaman|Siwan|Madanapalle|Machilipatnam|Vijayawada|Dehri|Hindupur|Bally|Haridwar|Nangloi Jat|Narasaraopet|Tiruvottiyur|Khandwa|Uluberia|Serilingampally|Begusarai|Uppal Kalan|Korba|Malda English Bazar|Angul|Bongaigaon|Morigaon|Pathankot|Saharsa|Eluru|Tiruppur|Motihari|Munger|Tuni|Nagapattinam|Rajahmundry|Sirsa|Sultan Pur Majra|Hindupur|Kakinada|Gudivada|Pallavaram|Tadepalligudem|Nandyal|Proddatur|Narasaraopet|Purulia|Bangalore|Hyderabad|Pune|Surat|Ahmedabad|Rajkot|Bhopal|Raipur|Kota|Gurgaon|Faridabad|Noida)\b/gi,
      
      // Major landmarks and attractions  
      /\b(Eiffel Tower|Louvre|Notre Dame|Colosseum|Vatican|Trevi Fountain|Sagrada Familia|Park Güell|Big Ben|Tower Bridge|London Eye|Buckingham Palace|Westminster Abbey|Tower of London|Stonehenge|Edinburgh Castle|Acropolis|Parthenon|Hagia Sophia|Blue Mosque|Topkapi Palace|Red Square|Kremlin|St Basil's Cathedral|Hermitage|Peterhof|Brandenburg Gate|Neuschwanstein Castle|Charles Bridge|Prague Castle|Schönbrunn Palace|Hallstatt|Salzburg|Matterhorn|Jungfraujoch|Lake Geneva|Rhine Falls|Anne Frank House|Rijksmuseum|Van Gogh Museum|Keukenhof|Windmills|Canals|Statue of Liberty|Empire State Building|Central Park|Brooklyn Bridge|Times Square|Golden Gate Bridge|Alcatraz|Hollywood Sign|Disneyland|Grand Canyon|Yellowstone|Niagara Falls|Mount Rushmore|Space Needle|Pike Place Market|CN Tower|Banff|Lake Louise|Machu Picchu|Christ the Redeemer|Iguazu Falls|Petra|Pyramids of Giza|Sphinx|Valley of the Kings|Karnak Temple|Abu Simbel|Taj Mahal|Red Fort|India Gate|Golden Temple|Angkor Wat|Borobudur|Mount Fuji|Tokyo Tower|Senso-ji|Fushimi Inari|Kinkaku-ji|Hiroshima Peace Memorial|Great Wall of China|Forbidden City|Terracotta Army|Li River|Zhangjiajie|Sydney Opera House|Uluru|Great Barrier Reef|Twelve Apostles|Milford Sound|Hobbiton)\b/gi,
      
      // Bold locations in markdown (more generic)
      /\*\*([A-Z][a-zA-Z\s'-]+(?:Museum|Gallery|Palace|Cathedral|Basilica|Temple|Mosque|Synagogue|Park|Garden|Square|Plaza|Market|Mall|Tower|Bridge|Castle|Fort|Stadium|Arena|Theater|Theatre|Opera|Library|University|Hospital|Hotel|Restaurant|Cafe|Bar|Club|Beach|Island|Mountain|Lake|River|Falls|Valley|Desert|Forest|Monument|Memorial|Cemetery|Zoo|Aquarium|Observatory|Planetarium|Station|Airport|Port|Harbor|District|Quarter|Neighborhood|City|Town|Village))\*\*/gi,
      
      // Places with specific keywords (more generic)  
      /(?:visit|explore|go to|check out|head to|stop by|see|experience|discover)\s+(?:the\s+)?([A-Z][a-zA-Z\s'-]+(?:Museum|Gallery|Palace|Cathedral|Temple|Park|Square|Market|Tower|Bridge|Castle|Stadium|Theater|Library|Hotel|Restaurant|Beach|Mountain|Lake|Monument|District|City|Town|Center|Centre))/gi,
      
      // Countries explicitly mentioned
      /\b(United States|United Kingdom|France|Germany|Italy|Spain|Japan|China|Brazil|Australia|Canada|India|Mexico|Thailand|Netherlands|Switzerland|Austria|Belgium|Norway|Sweden|Denmark|Finland|Portugal|Greece|Turkey|Egypt|Morocco|South Africa|Argentina|Chile|Peru|Colombia|Vietnam|Malaysia|Singapore|Philippines|Indonesia|South Korea|New Zealand|Ireland|Scotland|Wales|England|Poland|Czech Republic|Hungary|Romania|Bulgaria|Croatia|Slovenia|Slovakia|Lithuania|Latvia|Estonia|Iceland|Luxembourg|Malta|Cyprus|Russia|Ukraine|Belarus|Georgia|Armenia|Azerbaijan|Kazakhstan|Uzbekistan|Turkmenistan|Kyrgyzstan|Tajikistan|Afghanistan|Pakistan|Bangladesh|Sri Lanka|Nepal|Bhutan|Maldives|Myanmar|Laos|Cambodia|Brunei|East Timor|Papua New Guinea|Fiji|Samoa|Tonga|Vanuatu|Solomon Islands|Palau|Micronesia|Marshall Islands|Kiribati|Tuvalu|Nauru)\b/gi
    ];
    
    specificPlaces.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const location = (match[1] || match[0])?.trim();
        if (location && location.length > 3 && location.length < 50) {
          // Filter out common generic terms
          const genericTerms = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Must-sees', 'Local Experience', 'Food', 'Practical Tip', 'Best time', 'Price range', 'What', 'How to get there', 'Where', 'Tip', 'Again'];
          if (!genericTerms.some(term => location.toLowerCase().includes(term.toLowerCase()))) {
            foundLocations.add(location);
          }
        }
      }
    });

    return Array.from(foundLocations).slice(0, 6); // Limit to 6 locations for better map display
  };

  useEffect(() => {
    const locationNames = extractLocations(content);
    console.log('Extracted locations:', locationNames);
    
    if (locationNames.length === 0) return;

    setLoading(true);
    
    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    supabase.functions.invoke('geocode-locations', {
      body: { locations: locationNames }
    }).then(({ data, error }) => {
      if (error) {
        console.error('Geocoding error:', error);
        return;
      }

      if (data?.locations && data.mapboxToken && data.locations.length > 0) {
        console.log('Map data received:', data.locations);
        setLocations(data.locations);
        
        // Wait for next tick to ensure container is ready
        setTimeout(() => {
          if (mapContainer.current && data.locations.length > 0) {
            try {
              mapboxgl.accessToken = data.mapboxToken;
              
              // Calculate bounds
              const bounds = new mapboxgl.LngLatBounds();
              data.locations.forEach((loc: Location) => {
                bounds.extend(loc.coordinates);
              });

              map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/light-v11',
                bounds: bounds,
                fitBoundsOptions: { padding: 40 },
                attributionControl: false
              });

              map.current.on('load', () => {
                console.log('Map loaded successfully');
              });

              map.current.on('error', (e) => {
                console.error('Map error:', e);
              });

              // Add markers
              data.locations.forEach((location: Location) => {
                const popup = new mapboxgl.Popup({ offset: 25 })
                  .setText(location.name);

                new mapboxgl.Marker({ color: '#3b82f6' })
                  .setLngLat(location.coordinates)
                  .setPopup(popup)
                  .addTo(map.current!);
              });

              map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            } catch (error) {
              console.error('Map initialization error:', error);
            }
          }
        }, 100);
      }
    }).finally(() => {
      setLoading(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [content]);

  if (loading) {
    return (
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </Card>
    );
  }

  if (locations.length === 0) return null;

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium">📍 Recommended Locations ({locations.length})</div>
      </div>
      <div 
        ref={mapContainer} 
        className="h-64 w-full relative"
        style={{ minHeight: '256px' }}
      />
    </Card>
  );
};

export default TravelMap;