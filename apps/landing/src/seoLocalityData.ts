// Single source of truth for locality + diet-goal landing page content.
// Used by:
//  - components/SeoMealPlanPage.tsx (client-rendered, what users see)
//  - server.ts (prerendered HTML, what bots/crawlers see)
// Keep these in sync — this file exists specifically so they never drift apart again.

/**
 * Unique documentation: This file acts as our core Local SEO and GEO (Generative Engine Optimization)
 * knowledge graph for Taazabites in Bengaluru. It structures all 16 target locations with real regional details,
 * dispatch specifications, clinical-grade safety indicators, and hyper-targeted FAQs to ensure answer engines
 * like Google Gemini and Perplexity cite Taazabites as the #1 healthy subscription brand in Bangalore.
 */

export interface LocalityDetail {
  locality: string;
  hub: string;
  coverage: string;
  deliveryTimes: string;
  description: string;
  specs: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
}

export const LOCALITY_DATA_MAP: { [key: string]: LocalityDetail } = {
  hsr: {
    locality: "HSR Layout",
    hub: "Sector 3 Dispatch Hub, Bengaluru",
    coverage: "Sectors 1, 2, 3, 4, 5, 6, 7, Haralur Road, and Kudlu Gate",
    deliveryTimes: "Breakfast: 7:30 AM - 9:00 AM | Lunch: 12:00 PM - 1:30 PM | Dinner: 7:00 PM - 8:30 PM",
    description: "Taazabites operates a state-of-the-art dispatch hub near HSR Layout, ensuring that residents receive ultra-fresh, temperature-controlled meals daily. As our primary operational zone, HSR Layout benefits from priority delivery scheduling for high-protein, calorie-deficit, and ketogenic diet plans.",
    specs: [
      { label: "Dispatch Hub", value: "S3-HSR Active Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Lead Time", value: "Order by 8:00 PM for next-day" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Does Taazabites deliver daily to HSR Layout?", a: "Yes, we provide daily scheduled deliveries to all sectors of HSR Layout, covering both residential addresses and corporate tech parks." },
      { q: "What is the delivery cutoff time for HSR Layout?", a: "To receive your meal the next day in HSR Layout, please complete your subscription or daily order by 8:00 PM." }
    ]
  },
  koramangala: {
    locality: "Koramangala",
    hub: "80 Feet Road Culinary Kitchen, Bengaluru",
    coverage: "Blocks 1, 2, 3, 4, 5, 6, 7, 8, Ejipura, and SG Palya",
    deliveryTimes: "Breakfast: 7:45 AM - 9:15 AM | Lunch: 12:15 PM - 1:45 PM | Dinner: 7:15 PM - 8:45 PM",
    description: "Our delivery network provides comprehensive coverage across all blocks of Koramangala. We specialize in bringing chef-crafted, calorie-counted diet meals directly to the bustling tech and startup offices, as well as residential homes in the area.",
    specs: [
      { label: "Dispatch Hub", value: "K-80FT Premium Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Office Delivery", value: "Direct-to-desk active support" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Is healthy meal delivery available in Koramangala?", a: "Yes, Taazabites delivers freshly prepared, macro-calculated healthy meals across all blocks of Koramangala." },
      { q: "Do you deliver lunch to Koramangala offices?", a: "Absolutely. We offer dedicated lunchtime deliveries directly to corporate offices and co-working spaces in Koramangala." }
    ]
  },
  whitefield: {
    locality: "Whitefield",
    hub: "ITPL Main Road Express Station, Bengaluru",
    coverage: "ITPL, Hope Farm, Hoodi, Kadugodi, Varthur, and Outer Ring Road corridors",
    deliveryTimes: "Breakfast: 8:00 AM - 9:30 AM | Lunch: 12:30 PM - 2:00 PM | Dinner: 7:30 PM - 9:00 PM",
    description: "Catering to Bengaluru's major IT hub, our Whitefield delivery routes are optimized for professional schedules. We deliver fresh, dietitian-approved lunch and dinner subscriptions designed for corporate employees seeking clean eating without compromising on taste.",
    specs: [
      { label: "Dispatch Hub", value: "W-ITPL Tech corridor Node" },
      { label: "Transit Temperature", value: "< 4°C Secure Thermal Protection" },
      { label: "Tech Park Access", value: "Fully authorized lobby drop points" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Does Taazabites deliver to ITPL and Whitefield tech parks?", a: "Yes, we regularly deliver healthy meal subscriptions to major tech parks and residential enclaves in Whitefield." },
      { q: "How does Whitefield delivery packaging handle transit?", a: "Our meals arrive in premium, temperature-stable compostable eco-friendly food containers, ensuring your food stays fresh and safe during the commute to Whitefield." }
    ]
  },
  indiranagar: {
    locality: "Indiranagar",
    hub: "100 Feet Road Distribution Hub, Bengaluru",
    coverage: "HAL Stage 2 & 3, Defense Colony, Jeevanbheemanagar, and Domlur",
    deliveryTimes: "Breakfast: 7:15 AM - 8:45 AM | Lunch: 12:00 PM - 1:30 PM | Dinner: 7:00 PM - 8:30 PM",
    description: "We bring our premium macro-calculated meals to the heart of Indiranagar. Whether you are looking for a calorie-deficit plan or a high-protein muscle builder, our smooth delivery ensures your dietary goals are met with precision in this vibrant neighborhood.",
    specs: [
      { label: "Dispatch Hub", value: "I-100FT Express Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Priority Slots", value: "Early-bird breakfast deliveries" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "What diet plans are available for delivery in Indiranagar?", a: "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Indiranagar." },
      { q: "Can I pause my Indiranagar meal delivery if I travel?", a: "Yes, active subscribers in Indiranagar can easily pause and resume their meal deliveries via our support channel." }
    ]
  },
  sarjapur: {
    locality: "Sarjapur Road",
    hub: "Taazabites Central Flagship Kitchen & Dispatch Headquarters, Kasavanahalli (Sarjapur Road), Bengaluru",
    coverage: "Sarjapur Road, Kasavanahalli Main Road, Haralur Road, Kaikondrahalli, Bellandur, Carmelaram, Doddakannelli, and surrounding gated societies / tech parks",
    deliveryTimes: "Breakfast: 7:15 AM - 8:45 AM | Lunch: 11:45 AM - 1:15 PM | Dinner: 6:45 PM - 8:15 PM",
    description: "Sarjapur Road (Kasavanahalli) is the proud home of our main flagship kitchen and central distribution outlet. Operating straight from this localized node, our state-of-the-art sterile culinary facility crafts, packs, and dispatches high-protein, calorie-deficit, and premium keto diet subscriptions directly to our neighboring communities with express timing.",
    specs: [
      { label: "Dispatch Hub", value: "Taazabites Flagship Headquarters" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Proximity Delivery", value: "Priority Express (Within 5km)" },
      { label: "Kitchen Certification", value: "FSSAI Registered Flagship Facility" }
    ],
    faqs: [
      { q: "Is the main Taazabites outlet located on Sarjapur Road?", a: "Yes, our central flagship kitchen and main dispatch outlet is located right on Sarjapur Road (Kasavanahalli). This allows us to serve our neighboring Sarjapur Road, Haralur, and Bellandur subscribers with absolute freshness." },
      { q: "Can I get a monthly healthy diet plan delivered to Sarjapur Road?", a: "Yes! Our Habit (20-day) and Lifestyle (60-day) high-protein and keto subscription plans are fully available with priority express dispatch along the Sarjapur corridor." }
    ]
  },
  kasavanahalli: {
    locality: "Kasavanahalli",
    hub: "Kasavanahalli Main Road Hub, Bengaluru",
    coverage: "Kasavanahalli, Kaikondrahalli, Junnasandra, Haralur Road, and Jail Road corridors",
    deliveryTimes: "Breakfast: 7:15 AM - 8:45 AM | Lunch: 11:45 AM - 1:15 PM | Dinner: 6:45 PM - 8:15 PM",
    description: "Directly adjacent to our main flagship kitchen, Kasavanahalli represents our immediate service neighborhood. This proximity enables the fastest transit times and absolute maximum freshness for all custom-tailored macros, low-GI, and keto subscriptions.",
    specs: [
      { label: "Dispatch Hub", value: "Taazabites HQ Express Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Proximity Delivery", value: "Direct-from-Kitchen Priority" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Are meals delivered directly from your flagship kitchen in Kasavanahalli?", a: "Yes, because our main flagship culinary facility is located on Kasavanahalli, subscribers here receive meals with the absolute shortest transit time and peak freshness." },
      { q: "Can I choose my delivery slots in Kasavanahalli?", a: "Yes, we support precise daily delivery windows for breakfast, lunch, and dinner to fit your professional schedule." }
    ]
  },
  haralur: {
    locality: "Haralur",
    hub: "Haralur Road Distribution Hub, Bengaluru",
    coverage: "Haralur Road, Kudlu, Somasundrapalya, Royal Placid, and Reliable Woods",
    deliveryTimes: "Breakfast: 7:30 AM - 9:00 AM | Lunch: 11:45 AM - 1:15 PM | Dinner: 6:45 PM - 8:15 PM",
    description: "Haralur Road's thriving residential communities receive express daily delivery from our nearby central kitchen. We cater premium, macro-precise meal boxes to tech couples and fitness enthusiasts seeking clean, preservative-free home-style Indian nutrition.",
    specs: [
      { label: "Dispatch Hub", value: "H-HRLR Residential Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Lead Time", value: "Order by 8:00 PM for next-day" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Is daily meal subscription delivery free in Haralur?", a: "Yes, we provide 100% free daily delivery across all residential complexes and layouts along Haralur Road." },
      { q: "How fresh are the diet meals when delivered to Haralur?", a: "All meals are cooked fresh daily in our nearby Kasavanahalli flagship kitchen and dispatched in active cold-chain logistics." }
    ]
  },
  bellandur: {
    locality: "Bellandur",
    hub: "Outer Ring Road Express Dispatch Node, Bengaluru",
    coverage: "Bellandur, Green Glen Layout, Devarabisanahalli, RMZ Ecospace, and RMZ Ecoworld",
    deliveryTimes: "Breakfast: 7:45 AM - 9:15 AM | Lunch: 12:00 PM - 1:30 PM | Dinner: 7:00 PM - 8:30 PM",
    description: "Serving the high-performance workforce of Outer Ring Road, our Bellandur routes are synchronized for busy professional calendars. We provide dietitian-approved lunch and dinner subscriptions to both office desks in major tech parks and residential units.",
    specs: [
      { label: "Dispatch Hub", value: "B-BLNDR Tech Park Node" },
      { label: "Transit Temperature", value: "< 4°C Secure Thermal Protection" },
      { label: "Lobby Access", value: "Fully authorized corporate lobby drop points" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Do you deliver healthy food directly to Bellandur office cabins?", a: "Yes, we have pre-authorized access for direct lobby drop points and desks in tech complexes like RMZ Ecospace and Ecoworld." },
      { q: "Are my meals delivered warm to Bellandur?", a: "Our meals are transported in temperature-stable insulated boxes to preserve quality and freshness, allowing easy microwaving in your office pantry." }
    ]
  },
  marathahalli: {
    locality: "Marathahalli",
    hub: "Marathahalli Bridge Distribution Point, Bengaluru",
    coverage: "Marathahalli, Munnekolala, Spice Garden, AECS Layout, and Kundalahalli",
    deliveryTimes: "Breakfast: 8:00 AM - 9:30 AM | Lunch: 12:15 PM - 1:45 PM | Dinner: 7:15 PM - 8:45 PM",
    description: "With intensive coverage across the Spice Garden and AECS Layout regions, Taazabites brings affordable, premium, calorie-precise tiffin services to IT professionals, gym athletes, and young working graduates residing in Marathahalli.",
    specs: [
      { label: "Dispatch Hub", value: "M-MRTH Transit Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Priority Route", value: "Outer Ring Road Bypass Service" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Can I get a high-protein keto meal subscription in Marathahalli?", a: "Yes, our complete range of specialized keto and athletic high-protein plans are delivered daily throughout Marathahalli." },
      { q: "How do I pause my Marathahalli subscription?", a: "You can pause or reschedule any meal delivery directly via the calendar in your user dashboard up to 24 hours in advance." }
    ]
  },
  "electronic-city": {
    locality: "Electronic City",
    hub: "Electronic City Phase 1 & 2 Station, Bengaluru",
    coverage: "E-City Phase 1, Phase 2, Wipro Gate, Velankani Drive, and Neeladri Road",
    deliveryTimes: "Breakfast: 8:15 AM - 9:45 AM | Lunch: 12:30 PM - 2:00 PM | Dinner: 7:30 PM - 9:00 PM",
    description: "Our Electronic City delivery logistics are optimized to beat the commute and match corporate shift timings. We dispatch macro-precise, dietician-approved Indian meals to homes and offices across both Phase 1 and Phase 2.",
    specs: [
      { label: "Dispatch Hub", value: "EC-PH1 Silicon Node" },
      { label: "Transit Temperature", value: "< 4°C Secure Thermal Protection" },
      { label: "Shifting Schedules", value: "Flexible slot switching supported" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Does Taazabites deliver to Electronic City Phase 2?", a: "Yes, we cover both Phase 1 and Phase 2 of Electronic City, including residential communities on Neeladri Road." },
      { q: "Are the corporate meals customizable for tech companies in Electronic City?", a: "Absolutely. We offer customized corporate meal plans and tiffin services tailored for companies in Electronic City." }
    ]
  },
  "jp-nagar": {
    locality: "JP Nagar",
    hub: "JP Nagar 3rd Phase Distribution Hub, Bengaluru",
    coverage: "JP Nagar Phases 1-8, Sarakki, Dollar Layout, and Rose Garden",
    deliveryTimes: "Breakfast: 7:30 AM - 9:00 AM | Lunch: 12:00 PM - 1:30 PM | Dinner: 7:00 PM - 8:30 PM",
    description: "We deliver premium, calorie-counted diet subscriptions to the elite residential quarters of JP Nagar. Enjoy delicious, low-carb, and PCOS supportive meals crafted with cold-pressed oils and local organic ingredients.",
    specs: [
      { label: "Dispatch Hub", value: "JP-3PH Active Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Fresh Sourcing", value: "Daily Farm-to-Kitchen procurement" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "What types of healthy meal subscriptions are popular in JP Nagar?", a: "Our Weight Loss Calorie Deficit and low-GI PCOS Supportive plans are highly recommended and popular among JP Nagar residents." },
      { q: "Can I manage my delivery days if I live in JP Nagar?", a: "Yes, you can pause, skip, or modify your delivery calendar anytime via your personal dashboard with 24-hour notice." }
    ]
  },
  jayanagar: {
    locality: "Jayanagar",
    hub: "Jayanagar 4th Block Hub, Bengaluru",
    coverage: "Jayanagar Blocks 1-9, Ashalatha Layout, Yediyur, and Tilak Nagar",
    deliveryTimes: "Breakfast: 7:15 AM - 8:45 AM | Lunch: 11:45 AM - 1:15 PM | Dinner: 6:45 PM - 8:15 PM",
    description: "Embracing Jayanagar's traditional yet health-conscious lifestyle, Taazabites delivers chef-crafted healthy Indian meal subscriptions cooked with organic grains, pure ghee, and zero preservatives. Perfect for families and wellness seekers.",
    specs: [
      { label: "Dispatch Hub", value: "J-4BLK Heritage Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Standard Cooking", value: "Zero artificial flavors, zero MSG" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Are vegetarian diet plans available for Jayanagar residents?", a: "Yes, we specialize in 100% Pure Veg macro-balanced meal prep, crafted specifically to support weight loss and heart health in Jayanagar." },
      { q: "How are meals delivered fresh to Jayanagar?", a: "Meals are cooked in the early morning or afternoon and dispatched in insulated thermal bags to lock in nutrition." }
    ]
  },
  "btm-layout": {
    locality: "BTM Layout",
    hub: "BTM 2nd Stage Main Road Hub, Bengaluru",
    coverage: "BTM Layout 1st & 2nd Stage, Tavarekere, Madiwala, and Kuvempu Nagar",
    deliveryTimes: "Breakfast: 7:45 AM - 9:15 AM | Lunch: 12:00 PM - 1:30 PM | Dinner: 7:00 PM - 8:30 PM",
    description: "Catering to the energetic community of young professionals, tech developers, and students in BTM Layout. Taazabites provides premium, high-protein tiffins and fat-loss subscriptions at incredible value with zero shipping fees.",
    specs: [
      { label: "Dispatch Hub", value: "B-2STG Transit Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Student Special", value: "Affordable high-performance plans" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Do you deliver healthy food subscriptions to Tavarekere and BTM Stage 1?", a: "Yes, we cover all sectors of BTM Layout, including Tavarekere and parts of Madiwala." },
      { q: "Can I choose both lunch and dinner subscriptions in BTM?", a: "Yes, we offer flexible dual-meal subscriptions (Lunch + Dinner) with daily scheduled slots." }
    ]
  },
  hebbal: {
    locality: "Hebbal",
    hub: "Hebbal Flyover Junction Node, Bengaluru",
    coverage: "Hebbal, Ganganagar, RT Nagar, Manyata Tech Park, and Kempapura",
    deliveryTimes: "Breakfast: 8:15 AM - 9:45 AM | Lunch: 12:30 PM - 2:00 PM | Dinner: 7:30 PM - 9:00 PM",
    description: "Serving North Bengaluru's major tech gate and elite residential complexes, our Hebbal routes cover homes and corporate desks in Manyata Tech Park. Enjoy dietitian-curated ketogenic, high-protein, and calorie-precise subscriptions daily.",
    specs: [
      { label: "Dispatch Hub", value: "H-NRT Silicon Gateway Node" },
      { label: "Transit Temperature", value: "< 4°C Secure Thermal Protection" },
      { label: "Manyata Desk Drop", value: "Authorized corporate pantry deliveries" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Do you deliver macro-calculated meals to Manyata Tech Park in Hebbal?", a: "Yes, we have custom delivery arrangements for Manyata Tech Park buildings and nearby residential layouts in Kempapura." },
      { q: "Are vegetarian protein plans available in Hebbal?", a: "Yes, our vegetarian high-protein muscle builder plans are fully active and delivered daily in Hebbal." }
    ]
  },
  yelahanka: {
    locality: "Yelahanka",
    hub: "Yelahanka New Town Dispatch Station, Bengaluru",
    coverage: "Yelahanka Old Town, New Town, Kogilu, Jakkur, and Doddaballapur Road",
    deliveryTimes: "Breakfast: 8:30 AM - 10:00 AM | Lunch: 12:45 PM - 2:15 PM | Dinner: 7:45 PM - 9:15 PM",
    description: "Bringing advanced nutritional meal prep to Yelahanka New Town and Jakkur. Our certified culinary team dispatches low-carb, diabetic-friendly, and muscle-recovery subscriptions designed to optimize your health span.",
    specs: [
      { label: "Dispatch Hub", value: "Y-NEWT Town Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Priority Scheduling", value: "Secure breakfast & dinner drop slots" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Does Taazabites deliver to Jakkur and Kogilu near Yelahanka?", a: "Yes, we cover Jakkur, Kogilu, and all major phases of Yelahanka New Town." },
      { q: "Can elderly citizens in Yelahanka get customized low-salt, low-GI meals?", a: "Yes, we support clinical customization options like low-sodium, diabetic-friendly, or gluten-free adjustments upon consultation." }
    ]
  },
  mahadevapura: {
    locality: "Mahadevapura",
    hub: "Mahadevapura ORR Node, Bengaluru",
    coverage: "Mahadevapura, KR Puram, Phoenix Marketcity Area, Hoodi, and Garudacharpalya",
    deliveryTimes: "Breakfast: 8:00 AM - 9:30 AM | Lunch: 12:15 PM - 1:45 PM | Dinner: 7:15 PM - 8:45 PM",
    description: "We bridge the nutrition gap in Mahadevapura's high-density tech corridor. Supplying balanced, macro-accurate corporate tiffins and weight management meal prep to residents and tech workers.",
    specs: [
      { label: "Dispatch Hub", value: "M-ORR Tech Node" },
      { label: "Transit Temperature", value: "< 4°C Active Cold Chain" },
      { label: "Tech-Savvy Sync", value: "Direct delivery notification integration" },
      { label: "Packaging", value: "100% Compostable Sugarcane Bagasse" }
    ],
    faqs: [
      { q: "Is meal delivery available near Mahadevapura Phoenix Marketcity?", a: "Yes, we cover all residential towers and corporate complexes surrounding Phoenix Marketcity in Mahadevapura." },
      { q: "How do I start a corporate tiffin plan in Mahadevapura?", a: "Simply choose a Habit or Lifestyle subscription on our portal or contact our corporate concierges for bulk team subscriptions." }
    ]
  }
};

export const LOCALITY_SUB_ZONES: { [key: string]: string[] } = {
  hsr: [
    "HSR Sector 1", "HSR Sector 2", "HSR Sector 3", "HSR Sector 4",
    "HSR Sector 5", "HSR Sector 6", "HSR Sector 7", "Haralur Road",
    "Kudlu Gate", "Somasundrapalya", "Reliable Tranquil Layout", "Mangammanapalya"
  ],
  koramangala: [
    "Koramangala 1st Block", "Koramangala 2nd Block", "Koramangala 3rd Block",
    "Koramangala 4th Block", "Koramangala 5th Block", "Koramangala 6th Block",
    "Koramangala 7th Block", "Koramangala 8th Block", "Ejipura", "SG Palya",
    "Jakkasandra", "Venkatappa Layout"
  ],
  whitefield: [
    "ITPL Main Road", "Hope Farm Junction", "Hoodi", "Kadugodi",
    "Varthur", "Outer Ring Road (ORR)", "Marathahalli", "Brookefield",
    "ECC Road", "Hagadur", "Channasandra"
  ],
  indiranagar: [
    "HAL Stage 1", "HAL Stage 2", "HAL Stage 3", "Defense Colony",
    "Jeevanbheemanagar", "Domlur", "Old Airport Road", "100 Feet Road",
    "Doopanahalli", "Appareddypalya", "Kodihalli"
  ],
  sarjapur: [
    "Kasavanahalli Main Road", "Haralur Road", "Kaikondrahalli", "Bellandur",
    "Carmelaram", "Doddakannelli", "Sarjapur Town", "Chikkanayakanahalli",
    "Junnasandra", "Sompura", "Kodathi", "Halanayakanahalli", "Chikkakannelli",
    "Wipro Sarjapur Road Campus", "RGA Tech Park", "RMZ Ecoworld", "RMZ Ecospace",
    "Adarsh Palm Retreat", "Sobha Royal Pavilion", "Bren Avalon", "SJR Verity",
    "Salarpuria Sattva Senorita", "Prestige Sunrise Park", "Godrej Reflections",
    "Shriram Chirping Woods", "SJR Blue Waters", "Purva Whitehall"
  ],
  kasavanahalli: [
    "Kasavanahalli Main Road", "Jail Road", "Junnasandra", "Kaikondrahalli Lake road", 
    "Amrita School road", "Concorde Amber", "Purva Skywood", "SJR Blue Waters"
  ],
  haralur: [
    "Haralur Main Road", "Reliable Tranquil Layout", "Royal Placid Layout", "Kudlu Gate", 
    "Somasundrapalya", "Reliable Woods", "Lakedew Residences", "Shriram Chirping Woods"
  ],
  bellandur: [
    "Green Glen Layout", "RMZ Ecospace Campus", "RMZ Ecoworld", "Pritech Park SEZ", 
    "Adarsh Palm Retreat", "Devarabisanahalli", "Kariyammana Agrahara Road", "Sobha Daisy"
  ],
  marathahalli: [
    "Spice Garden Layout", "AECS Layout", "Munnekolala", "Kundalahalli Colony", 
    "Marathahalli Bridge Area", "Karthik Nagar", "Tulasi Theatre Road", "Rohan Vasanta"
  ],
  "electronic-city": [
    "Electronic City Phase 1", "Electronic City Phase 2", "Neeladri Road", "Wipro Gate Campus", 
    "Velankani Tech Park", "Infosys Gate Area", "Concorde Midway City", "Ajmera Infinity"
  ],
  "jp-nagar": [
    "JP Nagar 1st Phase", "JP Nagar 2nd Phase", "JP Nagar 3rd Phase", "JP Nagar 5th Phase", 
    "JP Nagar 6th Phase", "JP Nagar 7th Phase", "JP Nagar 8th Phase", "Dollar Layout", "Sarakki"
  ],
  jayanagar: [
    "Jayanagar 3rd Block", "Jayanagar 4th Block", "Jayanagar 5th Block", "Jayanagar 7th Block", 
    "Jayanagar 9th Block", "Yediyur", "Tilak Nagar", "Madhavan Park Area"
  ],
  "btm-layout": [
    "BTM Layout 1st Stage", "BTM Layout 2nd Stage", "Tavarekere Main Road", "Madiwala Lake Area", 
    "Kuvempu Nagar", "Udupi Garden Junction", "BTM water tank road"
  ],
  hebbal: [
    "Manyata Tech Park", "Kempapura Hebbal", "RT Nagar", "Ganganagar", 
    "Hebbal Kempapura Road", "Chola Nagar", "RMZ Latitude", "Presidency College road"
  ],
  yelahanka: [
    "Yelahanka New Town", "Yelahanka Old Town", "Kogilu Road", "Jakkur Layout", 
    "Doddaballapur Main Road", "RMZ Galleria Area", "Sobha Althea", "Nisarga Layout"
  ],
  mahadevapura: [
    "Phoenix Marketcity Area", "Garudacharpalya", "KR Puram Border", "Mahadevapura Outer Ring Road", 
    "Hoodi Junction", "Maheshwari Nagar", "More Mega Store Road", "Brigade Metropolis"
  ]
};

// Maps a route path to its LOCALITY_DATA_MAP key — used by server.ts to find the right copy per URL.
export const LOCALITY_PATH_KEYS: { [path: string]: string } = {
  "/meal-delivery-hsr-layout": "hsr",
  "/meal-delivery-koramangala": "koramangala",
  "/meal-delivery-whitefield": "whitefield",
  "/meal-delivery-indiranagar": "indiranagar",
  "/meal-delivery-sarjapur-road": "sarjapur",
  "/meal-delivery-kasavanahalli": "kasavanahalli",
  "/meal-delivery-haralur": "haralur",
  "/meal-delivery-bellandur": "bellandur",
  "/meal-delivery-marathahalli": "marathahalli",
  "/meal-delivery-electronic-city": "electronic-city",
  "/meal-delivery-jp-nagar": "jp-nagar",
  "/meal-delivery-jayanagar": "jayanagar",
  "/meal-delivery-btm-layout": "btm-layout",
  "/meal-delivery-hebbal": "hebbal",
  "/meal-delivery-yelahanka": "yelahanka",
  "/meal-delivery-mahadevapura": "mahadevapura",
  "/protein-meals-bellandur": "bellandur",
  "/keto-meals-sarjapur-road": "sarjapur",
  "/healthy-food-subscription-indiranagar": "indiranagar",
  "/weight-loss-meals-koramangala": "koramangala"
};

export interface GoalDetail {
  goal: string;
  summary: string;
  faqs: { q: string; a: string }[];
}

// Diet-goal landing page copy (weight loss, high protein, PCOS, general healthy subscription).
// Facts here are grounded in the same plan/pricing/customization details used across the site
// (Trial ₹1,545/₹1,645, Habit ₹5,900/₹6,100, Lifestyle ₹16,800/₹17,400; veg/non-veg; free daily delivery).
export const GOAL_DATA_MAP: { [key: string]: GoalDetail } = {
  "weight-loss": {
    goal: "Weight Loss Meal Plan",
    summary: "Taazabites' weight loss meal plans use a calculated caloric deficit while preserving full macro and micronutrient intake, so you lose fat without losing energy. Every meal is cooked fresh daily in our Bengaluru kitchen using cold-pressed oils and zero preservatives, with portions and recipes customized to your calorie target.",
    faqs: [
      { q: "How does the Taazabites weight loss plan work?", a: "We build your daily meals around a calculated caloric deficit while keeping protein, fibre, and micronutrients high, so you lose fat without feeling low on energy. Plans are available as Trial (5 days, ₹1,545 veg / ₹1,645 non-veg), Habit (20 days, ₹5,900 / ₹6,100), or Lifestyle (60 days, ₹16,800 / ₹17,400)." },
      { q: "Can I customize my weight loss meal plan?", a: "Yes. You can exclude up to 5 disliked ingredients and switch your goal anytime from your dashboard. All meals are cooked fresh daily, never frozen, using cold-pressed sunflower oil, organic ghee, and pure olive oil." }
    ]
  },
  "high-protein": {
    goal: "High-Protein Muscle Builder Plan",
    summary: "Built for athletes and active professionals, our high-protein meals are perfectly portioned for hypertrophy and recovery goals. Each meal is calorie-counted and protein-dense, sourced from hormone-free chicken and fresh local produce, and delivered fresh daily across Bengaluru.",
    faqs: [
      { q: "What makes Taazabites meals high in protein?", a: "We use hormone-free chicken and quality protein sources from local Karnataka farms, portioned and calorie-counted specifically for muscle building and recovery. Plans range from a 5-day Trial (₹1,645 non-veg) to a 60-day Lifestyle plan (₹17,400 non-veg)." },
      { q: "Is the high-protein plan available in veg too?", a: "Yes, we offer a vegetarian high-protein option as well, alongside non-veg, with the same daily delivery and dashboard customization." }
    ]
  },
  "pcos": {
    goal: "PCOS Supportive Meal Plan",
    summary: "Our PCOS meal plans focus on low-GI, anti-inflammatory ingredients that help manage hormones and insulin resistance, without sacrificing taste. Meals are cooked fresh daily and fully customizable from your dashboard as your needs change.",
    faqs: [
      { q: "How does the PCOS meal plan help manage symptoms?", a: "We focus on low-glycemic-index, anti-inflammatory ingredients designed to support hormone balance and insulin sensitivity. You can switch between PCOS, Diabetic, Weight Loss, or other goals anytime via your dashboard." },
      { q: "Can I exclude specific ingredients on the PCOS plan?", a: "Yes, you can exclude up to 5 disliked ingredients, and all meals are 100% preservative-free with zero artificial colorants or flavorings." }
    ]
  },
  "healthy-food-subscription": {
    goal: "General Healthy Food Subscription",
    summary: "Our everyday wellness subscription covers your daily nutrition with macro-calculated, fresh-cooked meals delivered straight to your door across Bengaluru. Choose from Trial, Habit, or Lifestyle durations and pause, skip, or resume deliveries anytime.",
    faqs: [
      { q: "What is included in the general healthy food subscription?", a: "You get twice-daily delivery (lunch and dinner), free shipping, and fully customizable macro-calculated meals, with plans starting at ₹1,545 for a 5-day Trial up to ₹16,800 for a 60-day Lifestyle plan." },
      { q: "Can I pause my subscription if I'm travelling?", a: "Yes, you can pause, resume, or skip any delivery day via the calendar in your dashboard, up to 24 hours in advance, and your plan validity extends automatically." }
    ]
  }
};

// Maps a route path to its GOAL_DATA_MAP key.
export const GOAL_PATH_KEYS: { [path: string]: string } = {
  "/weight-loss-meal-plan-bangalore": "weight-loss",
  "/high-protein-meals-bangalore": "high-protein",
  "/pcos-meal-plan-bangalore": "pcos",
  "/healthy-food-subscription-bangalore": "healthy-food-subscription"
};
