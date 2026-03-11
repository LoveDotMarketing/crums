// Location data registry for local SEO city pages

export interface LocationData {
  city: string;
  state: string;
  stateAbbr: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  distanceFromBulverde: number; // in miles
  isPickupFriendly: boolean; // true if within ~100 miles of Bulverde
  keyHighways: string[];
  keyIndustries: string[];
  nearbyAirports?: string[];
  portAccess?: string;
  regionalContext: string;
  nearbyCities: string[]; // slugs of nearby cities for cross-linking
  landmarks?: string; // Local landmarks or street references for hyper-local SEO
  testimonialSnippet?: { text: string; author: string }; // City-specific testimonial
}

// San Antonio, TX headquarters coordinates
export const HEADQUARTERS = {
  city: "San Antonio",
  state: "Texas",
  stateAbbr: "TX",
  address: "7450 Prue Rd #2",
  zip: "78249",
  phone: "1-888-570-4564",
  coordinates: { lat: 29.5527, lng: -98.6180 }
};

export const locations: LocationData[] = [
  // Texas - Pickup Friendly (within ~100 miles)
  {
    city: "San Antonio",
    state: "Texas",
    stateAbbr: "TX",
    slug: "san-antonio-tx",
    metaTitle: "Trailer Rental San Antonio TX | Local Pickup Available",
    metaDescription: "Trailer rental in San Antonio, TX. Pick up at our Bulverde yard (30 min) or get delivery. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in San Antonio, Texas",
    distanceFromBulverde: 30,
    isPickupFriendly: true,
    keyHighways: ["I-10", "I-35", "I-410", "US-281"],
    keyIndustries: ["Military logistics", "Healthcare distribution", "Aerospace", "Manufacturing"],
    nearbyAirports: ["SAT - San Antonio International"],
    regionalContext: "San Antonio is Texas's second-largest city and a major hub for military logistics with multiple bases including Joint Base San Antonio. The I-10 and I-35 corridors connect to major ports and distribution centers.",
    nearbyCities: ["austin-tx", "houston-tx"],
    landmarks: "Our Bulverde yard is easily accessible via Highway 281, just north of Loop 1604. We're 30 minutes from downtown San Antonio and the Riverwalk area.",
    testimonialSnippet: { text: "CRUMS got me rolling in 48 hours. No runaround, just a handshake and keys.", author: "R.M., San Antonio carrier" }
  },
  {
    city: "Austin",
    state: "Texas",
    stateAbbr: "TX",
    slug: "austin-tx",
    metaTitle: "Trailer Rental Austin TX | Easy Pickup from Bulverde",
    metaDescription: "Commercial trailer rental in Austin, TX. Easy pickup from Bulverde (1 hour) or delivery. Dry van and flatbed trailers available.",
    h1: "Trailer Rental & Leasing in Austin, Texas",
    distanceFromBulverde: 65,
    isPickupFriendly: true,
    keyHighways: ["I-35", "US-183", "US-290", "TX-130"],
    keyIndustries: ["Technology", "E-commerce fulfillment", "Food & beverage", "Construction"],
    nearbyAirports: ["AUS - Austin-Bergstrom International"],
    regionalContext: "Austin's booming tech sector and population growth have created high demand for freight and distribution services. The I-35 corridor connects Austin to major markets in Dallas and San Antonio.",
    nearbyCities: ["san-antonio-tx", "houston-tx", "dallas-tx"],
    landmarks: "We serve carriers across the Austin metro, from Round Rock and Cedar Park to Kyle and Buda. Just an hour south on I-35 from downtown Austin.",
    testimonialSnippet: { text: "As a new owner-operator, CRUMS took a chance on me. Best decision I made.", author: "T.L., Austin" }
  },
  {
    city: "New Braunfels",
    state: "Texas",
    stateAbbr: "TX",
    slug: "new-braunfels-tx",
    metaTitle: "Trailer Rental New Braunfels TX | 20 Min from HQ",
    metaDescription: "Trailer rental in New Braunfels, TX - 20 min from our Bulverde HQ. Same-day pickup or delivery. Dry van & flatbed trailers.",
    h1: "Trailer Rental & Leasing in New Braunfels, Texas",
    distanceFromBulverde: 20,
    isPickupFriendly: true,
    keyHighways: ["I-35", "TX-46", "TX-337"],
    keyIndustries: ["Manufacturing", "Tourism", "Retail distribution", "Agriculture"],
    regionalContext: "New Braunfels is one of the fastest-growing cities in America, located perfectly between San Antonio and Austin on the I-35 corridor. Our Bulverde location is just 20 minutes away.",
    nearbyCities: ["san-antonio-tx", "austin-tx"],
    landmarks: "Just off I-35 between San Antonio and Austin. Our Bulverde yard is a quick 20-minute drive via TX-46.",
    testimonialSnippet: { text: "Picked up my trailer the same day I called. That's service.", author: "J.K., New Braunfels" }
  },
  // Texas - Major Markets (Delivery)
  {
    city: "Houston",
    state: "Texas",
    stateAbbr: "TX",
    slug: "houston-tx",
    metaTitle: "Trailer Rental Houston TX | Delivery Available",
    metaDescription: "Trailer rental in Houston, TX. We deliver 53' dry van and flatbed trailers to the greater Houston area. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Houston, Texas",
    distanceFromBulverde: 180,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-45", "I-69", "US-59", "TX-99 (Grand Parkway)"],
    keyIndustries: ["Oil & gas", "Petrochemical", "Port logistics", "Healthcare", "Aerospace"],
    nearbyAirports: ["IAH - George Bush Intercontinental", "HOU - William P. Hobby"],
    portAccess: "Port of Houston - largest port in Texas and one of the busiest in the nation",
    regionalContext: "Houston is the largest trucking market in Texas and one of the largest in the nation. The Port of Houston handles over 250 million tons of cargo annually, creating massive demand for trailer capacity.",
    nearbyCities: ["san-antonio-tx", "dallas-tx", "austin-tx"],
    landmarks: "We deliver across the Houston metro, from The Woodlands and Katy to Pearland and Pasadena. Convenient access via I-10 from our Central Texas base.",
    testimonialSnippet: { text: "Delivery was on time and the trailer was spotless. Will lease again.", author: "M.S., Houston" }
  },
  {
    city: "Dallas",
    state: "Texas",
    stateAbbr: "TX",
    slug: "dallas-tx",
    metaTitle: "Trailer Rental Dallas TX | Delivery Available",
    metaDescription: "Trailer rental in Dallas, TX. We deliver commercial trailers to DFW. Dry van and flatbed trailers with flexible terms.",
    h1: "Trailer Rental & Leasing in Dallas, Texas",
    distanceFromBulverde: 275,
    isPickupFriendly: false,
    keyHighways: ["I-35", "I-30", "I-20", "I-45", "US-75"],
    keyIndustries: ["Retail distribution", "E-commerce", "Technology", "Telecommunications", "Financial services"],
    nearbyAirports: ["DFW - Dallas/Fort Worth International", "DAL - Dallas Love Field"],
    regionalContext: "Dallas-Fort Worth is a major logistics hub and crossroads of America. The I-35 corridor connects to major markets in Mexico, and multiple interstates make DFW a natural distribution center.",
    nearbyCities: ["houston-tx", "austin-tx", "fort-worth-tx", "oklahoma-city-ok"],
    landmarks: "Serving the entire DFW metroplex from Frisco and Plano to Grand Prairie and Arlington. I-35 corridor delivery from Central Texas.",
    testimonialSnippet: { text: "Fair rates, good equipment, and they actually answer the phone.", author: "C.D., Dallas" }
  },
  {
    city: "Fort Worth",
    state: "Texas",
    stateAbbr: "TX",
    slug: "fort-worth-tx",
    metaTitle: "Trailer Rental Fort Worth TX | Delivery Available",
    metaDescription: "Trailer leasing in Fort Worth, TX. Commercial trailers delivered to DFW. 53' dry van and flatbed trailers available.",
    h1: "Trailer Rental & Leasing in Fort Worth, Texas",
    distanceFromBulverde: 280,
    isPickupFriendly: false,
    keyHighways: ["I-35W", "I-30", "I-20", "TX-121"],
    keyIndustries: ["Aerospace", "Defense", "Manufacturing", "Logistics", "Railroads"],
    nearbyAirports: ["DFW - Dallas/Fort Worth International", "AFW - Fort Worth Alliance"],
    regionalContext: "Fort Worth is a major logistics center with Alliance Texas, one of the largest inland ports in the nation. The city's strategic location makes it ideal for distribution operations.",
    nearbyCities: ["dallas-tx", "austin-tx", "houston-tx"],
    landmarks: "Serving Fort Worth from the Stockyards to Alliance Airport. Easy I-35 access from our Central Texas yard for delivery across Tarrant County.",
    testimonialSnippet: { text: "Solid trailers, fair prices, and they understand owner-operators.", author: "B.H., Fort Worth" }
  },
  // Major National Logistics Hubs
  {
    city: "Los Angeles",
    state: "California",
    stateAbbr: "CA",
    slug: "los-angeles-ca",
    metaTitle: "Trailer Rental Los Angeles CA | Texas Prices, Delivered",
    metaDescription: "Trailer rental in Los Angeles, CA. Commercial trailers delivered to SoCal. Serving the nation's largest trucking market.",
    h1: "Trailer Rental & Leasing in Los Angeles, California",
    distanceFromBulverde: 1350,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-5", "I-15", "I-110", "I-405"],
    keyIndustries: ["Port logistics", "Entertainment", "E-commerce", "Manufacturing", "Food distribution"],
    nearbyAirports: ["LAX - Los Angeles International", "ONT - Ontario International"],
    portAccess: "Port of Los Angeles & Port of Long Beach - busiest container port complex in the Western Hemisphere",
    regionalContext: "Los Angeles is the largest trucking market in the United States. The ports of LA and Long Beach handle nearly half of all containers entering the U.S., creating enormous demand for trailer capacity.",
    nearbyCities: ["phoenix-az", "denver-co", "portland-or", "seattle-wa"],
    landmarks: "We deliver across LA County from the Port of Long Beach to the Inland Empire. Serving carriers on I-10 from San Bernardino to Santa Monica.",
    testimonialSnippet: { text: "Needed a trailer for port work in Long Beach. CRUMS delivered on time and the equipment was solid.", author: "A.R., Los Angeles" }
  },
  {
    city: "Chicago",
    state: "Illinois",
    stateAbbr: "IL",
    slug: "chicago-il",
    metaTitle: "Trailer Rental Chicago IL | Texas Prices, Delivered",
    metaDescription: "Trailer rental in Chicago, IL. Delivered nationwide from Texas at competitive rates. 53' dry van and flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Chicago, Illinois",
    distanceFromBulverde: 1150,
    isPickupFriendly: false,
    keyHighways: ["I-90", "I-94", "I-55", "I-57", "I-80"],
    keyIndustries: ["Intermodal", "Manufacturing", "Food processing", "Retail distribution", "Financial services"],
    nearbyAirports: ["ORD - O'Hare International", "MDW - Midway International"],
    regionalContext: "Chicago is the freight capital of North America, where six of the seven major Class I railroads converge. The city handles more intermodal freight than any other location in the Western Hemisphere.",
    nearbyCities: ["indianapolis-in", "kansas-city-mo"],
    landmarks: "Serving Chicagoland from Joliet intermodal yards to O'Hare freight operations. We deliver to carriers across Cook, DuPage, and Will counties.",
    testimonialSnippet: { text: "Running freight out of Chicago is tough. CRUMS makes the equipment part easy.", author: "P.W., Chicago" }
  },
  {
    city: "Atlanta",
    state: "Georgia",
    stateAbbr: "GA",
    slug: "atlanta-ga",
    metaTitle: "Trailer Rental Atlanta GA | Texas Prices, Delivered",
    metaDescription: "Trailer leasing in Atlanta, GA. Commercial trailers delivered to metro Atlanta. Serving the Southeast's largest logistics hub.",
    h1: "Trailer Rental & Leasing in Atlanta, Georgia",
    distanceFromBulverde: 920,
    isPickupFriendly: false,
    keyHighways: ["I-85", "I-75", "I-20", "I-285"],
    keyIndustries: ["E-commerce", "Retail distribution", "Beverage", "Automotive", "Film production"],
    nearbyAirports: ["ATL - Hartsfield-Jackson Atlanta International"],
    regionalContext: "Atlanta is the logistics hub of the Southeast, where I-85, I-75, and I-20 converge. Hartsfield-Jackson is the world's busiest airport, and the region is home to major corporate headquarters.",
    nearbyCities: ["charlotte-nc", "nashville-tn", "memphis-tn", "jacksonville-fl"],
    landmarks: "Delivering across metro Atlanta from Marietta to McDonough. Convenient for carriers working the I-75 and I-85 corridors through Georgia.",
    testimonialSnippet: { text: "Southeast runs are my bread and butter. CRUMS keeps me rolling with reliable equipment.", author: "D.J., Atlanta" }
  },
  {
    city: "Memphis",
    state: "Tennessee",
    stateAbbr: "TN",
    slug: "memphis-tn",
    metaTitle: "Trailer Rental Memphis TN | FedEx Hub Area | Texas Prices",
    metaDescription: "Trailer rental in Memphis, TN - America's distribution center. We deliver commercial trailers to the Memphis area. Near the FedEx SuperHub.",
    h1: "Trailer Rental & Leasing in Memphis, Tennessee",
    distanceFromBulverde: 680,
    isPickupFriendly: false,
    keyHighways: ["I-40", "I-55", "I-240"],
    keyIndustries: ["Logistics", "Distribution", "Medical devices", "Agriculture", "Manufacturing"],
    nearbyAirports: ["MEM - Memphis International (FedEx SuperHub)"],
    portAccess: "Port of Memphis - 4th largest inland port in the United States",
    regionalContext: "Memphis is America's Distribution Center, home to the FedEx SuperHub and one of the nation's largest inland ports. The city's central location makes it ideal for reaching 50% of the U.S. population within a day's drive.",
    nearbyCities: ["nashville-tn", "atlanta-ga", "dallas-tx"],
    landmarks: "Serving carriers near the FedEx SuperHub, Lamar Ave industrial corridor, and the Port of Memphis. I-40 and I-55 access throughout Shelby County.",
    testimonialSnippet: { text: "Memphis freight is non-stop. CRUMS understands that and keeps my trailer in top shape.", author: "L.T., Memphis" }
  },
  {
    city: "Phoenix",
    state: "Arizona",
    stateAbbr: "AZ",
    slug: "phoenix-az",
    metaTitle: "Trailer Rental Phoenix AZ | Texas Prices, Delivered",
    metaDescription: "Trailer rental in Phoenix, AZ. 53' dry van and flatbed trailers delivered to Phoenix metro. Serving the fast-growing Southwest.",
    h1: "Trailer Rental & Leasing in Phoenix, Arizona",
    distanceFromBulverde: 870,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-17", "I-40", "US-60"],
    keyIndustries: ["Semiconductor manufacturing", "Aerospace", "E-commerce", "Construction", "Agriculture"],
    nearbyAirports: ["PHX - Phoenix Sky Harbor International"],
    regionalContext: "Phoenix is one of the fastest-growing metros in the nation with booming semiconductor and manufacturing sectors. The I-10 corridor connects Phoenix to Los Angeles and Texas markets.",
    nearbyCities: ["los-angeles-ca", "denver-co"],
    landmarks: "Serving the Valley from Mesa to Goodyear. We deliver to carriers along the I-10 corridor and the Loop 101/202 distribution zones.",
    testimonialSnippet: { text: "Texas to Phoenix runs are my specialty. CRUMS trailers handle the desert heat no problem.", author: "S.G., Phoenix" }
  },
  // Additional High-Volume Markets
  {
    city: "Indianapolis",
    state: "Indiana",
    stateAbbr: "IN",
    slug: "indianapolis-in",
    metaTitle: "Trailer Rental Indianapolis IN | Texas Prices, Delivered",
    metaDescription: "Trailer leasing in Indianapolis, IN. Texas prices, delivered nationwide to central Indiana. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Indianapolis, Indiana",
    distanceFromBulverde: 1050,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-65", "I-69", "I-74"],
    keyIndustries: ["Automotive", "Pharmaceutical", "Logistics", "Manufacturing", "Agriculture"],
    nearbyAirports: ["IND - Indianapolis International"],
    regionalContext: "Indianapolis is known as the Crossroads of America, where more interstate highways converge than any other U.S. city. The central location provides access to 75% of the U.S. population within a day's drive.",
    nearbyCities: ["chicago-il", "nashville-tn", "kansas-city-mo", "columbus-oh"],
    landmarks: "Serving carriers from the Indianapolis Motor Speedway area to the Plainfield logistics parks. Central access via I-70 and I-65 interchange.",
    testimonialSnippet: { text: "Crossroads means I'm going everywhere. CRUMS has the right trailer for every haul.", author: "K.M., Indianapolis" }
  },
  {
    city: "Nashville",
    state: "Tennessee",
    stateAbbr: "TN",
    slug: "nashville-tn",
    metaTitle: "Trailer Rental Nashville TN | Texas Prices, Delivered",
    metaDescription: "Trailer rental in Nashville, TN. Dry van and flatbed trailers delivered to Middle Tennessee. Fast-growing logistics market.",
    h1: "Trailer Rental & Leasing in Nashville, Tennessee",
    distanceFromBulverde: 780,
    isPickupFriendly: false,
    keyHighways: ["I-40", "I-65", "I-24"],
    keyIndustries: ["Healthcare", "Automotive", "Music industry", "Logistics", "E-commerce"],
    nearbyAirports: ["BNA - Nashville International"],
    regionalContext: "Nashville is one of the fastest-growing cities in America with a booming logistics sector. The convergence of I-40, I-65, and I-24 makes it a strategic distribution point for the Southeast.",
    nearbyCities: ["memphis-tn", "atlanta-ga", "indianapolis-in"],
    landmarks: "Delivering across Middle Tennessee from Murfreesboro to Franklin. Serving carriers near the La Vergne and Smyrna distribution hubs.",
    testimonialSnippet: { text: "Nashville's booming and so is my business. CRUMS scales with me.", author: "N.B., Nashville" }
  },
  {
    city: "Charlotte",
    state: "North Carolina",
    stateAbbr: "NC",
    slug: "charlotte-nc",
    metaTitle: "Trailer Rental Charlotte NC | CRUMS Leasing",
    metaDescription: "Trailer rental in Charlotte, NC. Nationwide delivery from Texas at competitive rates. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Charlotte, North Carolina",
    distanceFromBulverde: 1100,
    isPickupFriendly: false,
    keyHighways: ["I-85", "I-77", "I-485"],
    keyIndustries: ["Banking", "Automotive", "E-commerce", "Food processing", "Energy"],
    nearbyAirports: ["CLT - Charlotte Douglas International"],
    regionalContext: "Charlotte is a major East Coast distribution hub on the I-85 corridor. The city's central East Coast location and strong infrastructure make it ideal for serving markets from Atlanta to Washington D.C.",
    nearbyCities: ["atlanta-ga", "nashville-tn", "richmond-va", "jacksonville-fl"],
    landmarks: "Serving the Charlotte metro from Uptown to the I-485 outer belt. Delivering to carriers near Charlotte Douglas Airport and the Concord distribution zone.",
    testimonialSnippet: { text: "I-85 corridor is my life. CRUMS equipment handles the miles like a champ.", author: "E.C., Charlotte" }
  },
  {
    city: "Denver",
    state: "Colorado",
    stateAbbr: "CO",
    slug: "denver-co",
    metaTitle: "Trailer Rental Denver CO | CRUMS Leasing",
    metaDescription: "Trailer rental in Denver, CO. Delivered from Texas at competitive rates. 53' dry van & flatbed trailers for the Front Range. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Denver, Colorado",
    distanceFromBulverde: 930,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-25", "I-76", "US-36"],
    keyIndustries: ["Aerospace", "Technology", "Energy", "Outdoor recreation", "Food & beverage"],
    nearbyAirports: ["DEN - Denver International"],
    regionalContext: "Denver is the gateway to the Mountain West, serving as the primary distribution hub for the Rocky Mountain region. The I-70 and I-25 corridors connect Denver to major markets in all directions.",
    nearbyCities: ["phoenix-az", "kansas-city-mo"],
    landmarks: "Delivering across the Front Range from Fort Collins to Colorado Springs. Easy access to I-70 mountain corridor and I-25 north-south routes.",
    testimonialSnippet: { text: "Mountain runs require tough trailers. CRUMS delivers every time.", author: "J.P., Denver" }
  },
  {
    city: "Kansas City",
    state: "Missouri",
    stateAbbr: "MO",
    slug: "kansas-city-mo",
    metaTitle: "Trailer Rental Kansas City MO | CRUMS Leasing",
    metaDescription: "Trailer leasing in Kansas City, MO. Delivered from Texas at competitive rates. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Kansas City, Missouri",
    distanceFromBulverde: 690,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-35", "I-29", "I-49"],
    keyIndustries: ["Intermodal", "Automotive", "Agriculture", "Manufacturing", "E-commerce"],
    nearbyAirports: ["MCI - Kansas City International"],
    regionalContext: "Kansas City is a major freight hub where I-70 and I-35 intersect, connecting major markets from coast to coast and border to border. The city is a growing intermodal and e-commerce fulfillment center.",
    nearbyCities: ["denver-co", "chicago-il", "dallas-tx", "indianapolis-in", "des-moines-ia", "oklahoma-city-ok"],
    landmarks: "Serving the KC metro from the Fairfax industrial district to the Logistics Park Kansas City. I-35 corridor access for carriers on both sides of the state line.",
    testimonialSnippet: { text: "KC is where America's freight meets. CRUMS keeps my business moving.", author: "W.R., Kansas City" }
  },
  // Ohio - Validated by organic lead conversion
  {
    city: "Columbus",
    state: "Ohio",
    stateAbbr: "OH",
    slug: "columbus-oh",
    metaTitle: "Trailer Rental Columbus OH | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Columbus, OH. Texas-based pricing delivered to Ohio — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Columbus, Ohio",
    distanceFromBulverde: 1250,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-71", "I-270", "I-670"],
    keyIndustries: ["Logistics/distribution", "Automotive (Honda Marysville)", "E-commerce (Amazon fulfillment)", "Agriculture", "Steel"],
    nearbyAirports: ["CMH - John Glenn Columbus International"],
    regionalContext: "Columbus is Ohio's capital and fastest-growing city, sitting at the I-70/I-71 crossroads. A major logistics hub with massive Amazon and distribution center presence, 60% of the US population is reachable within a day's drive from Columbus.",
    nearbyCities: ["indianapolis-in", "charlotte-nc", "philadelphia-pa"],
    landmarks: "Serving carriers near Rickenbacker Intermodal Yard, the Groveport logistics corridor, Honda Marysville plant, and the I-270 outer belt distribution centers.",
    testimonialSnippet: { text: "Texas prices beat what I was paying up here. And they delivered it right to my yard.", author: "Ohio carrier" }
  },
  // Nationwide Expansion — Texas prices + delivery focus
  {
    city: "Philadelphia",
    state: "Pennsylvania",
    stateAbbr: "PA",
    slug: "philadelphia-pa",
    metaTitle: "Trailer Rental Philadelphia PA | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Philadelphia, PA. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Philadelphia, Pennsylvania",
    distanceFromBulverde: 1750,
    isPickupFriendly: false,
    keyHighways: ["I-76", "I-95", "I-476", "PA Turnpike"],
    keyIndustries: ["Pharma distribution", "Retail", "E-commerce fulfillment", "Port logistics", "Food processing"],
    nearbyAirports: ["PHL - Philadelphia International"],
    portAccess: "Port of Philadelphia — major East Coast container and breakbulk port",
    regionalContext: "Philadelphia sits at the heart of the I-95 corridor, one of the most heavily trafficked freight lanes in the country. The region's pharma, retail, and e-commerce sectors drive consistent trailer demand year-round.",
    nearbyCities: ["charlotte-nc", "columbus-oh", "richmond-va", "new-york-ny"],
    landmarks: "Serving the Greater Philadelphia area from the Port of Philadelphia to King of Prussia distribution centers. Easy access via I-76, I-95, and the PA Turnpike.",
    testimonialSnippet: { text: "Leasing locally in Philly was expensive. CRUMS delivered from Texas and saved me hundreds a month.", author: "D.M., Philadelphia" }
  },
  {
    city: "Jacksonville",
    state: "Florida",
    stateAbbr: "FL",
    slug: "jacksonville-fl",
    metaTitle: "Trailer Rental Jacksonville FL | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Jacksonville, FL. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Jacksonville, Florida",
    distanceFromBulverde: 1000,
    isPickupFriendly: false,
    keyHighways: ["I-95", "I-10", "I-295"],
    keyIndustries: ["Port logistics", "Import/export", "Cold chain", "Distribution", "Military logistics"],
    nearbyAirports: ["JAX - Jacksonville International"],
    portAccess: "JAXPORT — one of the fastest-growing container ports on the East Coast",
    regionalContext: "Jacksonville is Florida's logistics gateway where I-95 meets I-10, connecting the East Coast corridor to the Gulf states. JAXPORT handles growing container volumes and the city is a major distribution hub for the Southeast.",
    nearbyCities: ["atlanta-ga", "charlotte-nc"],
    landmarks: "Delivering across the Jacksonville metro from the Westside industrial district near JAXPORT to the I-295 distribution corridor and Cecil Commerce Center.",
    testimonialSnippet: { text: "Florida trailer prices are wild. CRUMS shipped one from Texas and I'm saving big every month.", author: "R.T., Jacksonville" }
  },
  {
    city: "Richmond",
    state: "Virginia",
    stateAbbr: "VA",
    slug: "richmond-va",
    metaTitle: "Trailer Rental Richmond VA | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Richmond, VA. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Richmond, Virginia",
    distanceFromBulverde: 1500,
    isPickupFriendly: false,
    keyHighways: ["I-95", "I-64", "I-85", "I-295"],
    keyIndustries: ["Distribution", "Amazon fulfillment", "Port access", "Agriculture", "Government logistics"],
    nearbyAirports: ["RIC - Richmond International"],
    portAccess: "Port of Virginia (nearby) — one of the deepest harbors on the East Coast",
    regionalContext: "Richmond sits at the crossroads of I-95 and I-64, making it a strategic mid-Atlantic distribution point. The region has seen explosive growth in fulfillment centers and serves as a gateway between the Northeast and Southeast.",
    nearbyCities: ["charlotte-nc", "philadelphia-pa"],
    landmarks: "Serving the Richmond metro from the Hanover County industrial parks to the I-95/I-64 interchange logistics hub. Convenient access to the Port of Virginia via I-64.",
    testimonialSnippet: { text: "Virginia leasing rates had me looking elsewhere. Texas prices from CRUMS were the answer.", author: "B.W., Richmond" }
  },
  {
    city: "Des Moines",
    state: "Iowa",
    stateAbbr: "IA",
    slug: "des-moines-ia",
    metaTitle: "Trailer Rental Des Moines IA | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Des Moines, IA. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Des Moines, Iowa",
    distanceFromBulverde: 1100,
    isPickupFriendly: false,
    keyHighways: ["I-80", "I-35", "I-235"],
    keyIndustries: ["Agriculture", "Food processing", "Distribution", "Insurance logistics", "Manufacturing"],
    nearbyAirports: ["DSM - Des Moines International"],
    regionalContext: "Des Moines is Iowa's capital and a major crossroads where I-80 and I-35 meet. The region's agricultural, food processing, and distribution industries create steady demand for trailer capacity throughout the year.",
    nearbyCities: ["kansas-city-mo", "chicago-il"],
    landmarks: "Serving carriers across central Iowa from the Ankeny distribution corridor to the I-80/I-35 interchange industrial parks and Grimes logistics hub.",
    testimonialSnippet: { text: "Midwest leasing options were limited and overpriced. CRUMS delivered from Texas and the savings are real.", author: "H.J., Des Moines" }
  },
  {
    city: "Portland",
    state: "Oregon",
    stateAbbr: "OR",
    slug: "portland-or",
    metaTitle: "Trailer Rental Portland OR | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Portland, OR. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Portland, Oregon",
    distanceFromBulverde: 2100,
    isPickupFriendly: false,
    keyHighways: ["I-5", "I-84", "I-205"],
    keyIndustries: ["Timber", "Tech manufacturing", "Agriculture", "Port logistics", "Sustainable goods"],
    nearbyAirports: ["PDX - Portland International"],
    portAccess: "Port of Portland — key Pacific Northwest gateway for agriculture and manufacturing exports",
    regionalContext: "Portland is the Pacific Northwest's primary logistics hub, connecting I-5's north-south West Coast corridor with I-84's route to the inland Northwest. The region's timber, tech, and agricultural sectors drive strong trailer demand.",
    nearbyCities: ["los-angeles-ca", "seattle-wa"],
    landmarks: "Delivering across the Portland metro from the Swan Island industrial district to the Rivergate terminal area and Troutdale distribution zone along I-84.",
    testimonialSnippet: { text: "West Coast trailer rates are brutal. CRUMS shipped from Texas and I'm paying way less than local options.", author: "M.K., Portland" }
  },
  {
    city: "New York City",
    state: "New York",
    stateAbbr: "NY",
    slug: "new-york-ny",
    metaTitle: "Trailer Rental New York City NY | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in New York City, NY. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in New York City, New York",
    distanceFromBulverde: 1800,
    isPickupFriendly: false,
    keyHighways: ["I-95", "I-78", "I-87", "I-278"],
    keyIndustries: ["Port logistics", "E-commerce fulfillment", "Retail distribution", "Food & beverage", "Construction"],
    nearbyAirports: ["JFK - John F. Kennedy International", "EWR - Newark Liberty International"],
    portAccess: "Port of New York & New Jersey — largest port complex on the East Coast",
    regionalContext: "New York City is the largest freight market on the East Coast. The Port of NY/NJ handles the most container volume of any East Coast port, and the metro area's massive consumer base drives enormous demand for trailer capacity year-round.",
    nearbyCities: ["philadelphia-pa"],
    landmarks: "Serving the tri-state area from the Hunts Point distribution center in the Bronx to the NJ Turnpike corridor. Delivering to carriers across Brooklyn, Queens, and the I-95 Northeast Corridor.",
    testimonialSnippet: { text: "NYC leasing rates are insane. CRUMS delivered from Texas and I'm saving over $400 a month.", author: "J.R., New York" }
  },
  {
    city: "Oklahoma City",
    state: "Oklahoma",
    stateAbbr: "OK",
    slug: "oklahoma-city-ok",
    metaTitle: "Trailer Rental Oklahoma City OK | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Oklahoma City, OK. Texas-based pricing delivered to Oklahoma — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Oklahoma City, Oklahoma",
    distanceFromBulverde: 450,
    isPickupFriendly: false,
    keyHighways: ["I-35", "I-40", "I-44"],
    keyIndustries: ["Oil & gas", "Agriculture", "Distribution", "Aerospace", "Manufacturing"],
    nearbyAirports: ["OKC - Will Rogers World Airport"],
    regionalContext: "Oklahoma City sits at the crossroads of I-35 and I-40, connecting Texas markets to the Midwest. The region's oil & gas, agriculture, and distribution sectors drive steady trailer demand. Just 450 miles from our Texas base — one of our closest out-of-state markets.",
    nearbyCities: ["dallas-tx", "kansas-city-mo"],
    landmarks: "Serving the OKC metro from the Tinker AFB logistics corridor to the I-35/I-40 interchange distribution centers and the Will Rogers World Airport cargo area.",
    testimonialSnippet: { text: "Oklahoma to Texas is a quick run. CRUMS had my trailer delivered next day at half the local price.", author: "C.B., Oklahoma City" }
  },
  {
    city: "Seattle",
    state: "Washington",
    stateAbbr: "WA",
    slug: "seattle-wa",
    metaTitle: "Trailer Rental Seattle WA | Texas Prices, Delivered | CRUMS Leasing",
    metaDescription: "Trailer rental in Seattle, WA. Texas-based pricing delivered nationwide — save more than leasing locally. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Seattle, Washington",
    distanceFromBulverde: 2200,
    isPickupFriendly: false,
    keyHighways: ["I-5", "I-90", "I-405"],
    keyIndustries: ["Port logistics", "Tech", "Timber", "Agriculture", "Aerospace"],
    nearbyAirports: ["SEA - Seattle-Tacoma International"],
    portAccess: "Port of Seattle & Port of Tacoma — major Pacific trade gateway, the Northwest Seaport Alliance",
    regionalContext: "Seattle is the Pacific Northwest's largest metro and a critical gateway for trans-Pacific trade. The ports of Seattle and Tacoma form the Northwest Seaport Alliance, handling massive container volumes. The I-5 corridor connects to Portland and California markets.",
    nearbyCities: ["portland-or", "los-angeles-ca"],
    landmarks: "Delivering across the Puget Sound region from the Port of Tacoma to the SoDo industrial district and Kent Valley distribution centers along I-5.",
    testimonialSnippet: { text: "Seattle trailer prices are sky-high. CRUMS shipped from Texas and the savings are unreal.", author: "T.N., Seattle" }
  }
];

// Helper function to get location by slug
export const getLocationBySlug = (slug: string): LocationData | undefined => {
  return locations.find(loc => loc.slug === slug);
};

// Helper function to get all location slugs
export const getAllLocationSlugs = (): string[] => {
  return locations.map(loc => loc.slug);
};

// Helper function to get nearby locations
export const getNearbyLocations = (slug: string): LocationData[] => {
  const location = getLocationBySlug(slug);
  if (!location) return [];
  
  return location.nearbyCities
    .map(citySlug => getLocationBySlug(citySlug))
    .filter((loc): loc is LocationData => loc !== undefined);
};

// Group locations by region for the hub page
export const getLocationsByRegion = () => {
  const texas = locations.filter(loc => loc.stateAbbr === "TX");
  const southwest = locations.filter(loc => ["CA", "AZ", "OK"].includes(loc.stateAbbr));
  const midwest = locations.filter(loc => ["IL", "IN", "MO", "OH", "IA"].includes(loc.stateAbbr));
  const southeast = locations.filter(loc => ["GA", "TN", "NC", "FL", "VA"].includes(loc.stateAbbr));
  const mountain = locations.filter(loc => ["CO"].includes(loc.stateAbbr));
  const northeast = locations.filter(loc => ["PA", "NY"].includes(loc.stateAbbr));
  const west = locations.filter(loc => ["OR", "WA"].includes(loc.stateAbbr));
  
  return { texas, southwest, midwest, southeast, mountain, northeast, west };
};

// Get pickup-friendly locations
export const getPickupFriendlyLocations = (): LocationData[] => {
  return locations.filter(loc => loc.isPickupFriendly);
};
