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
    metaTitle: "Trailer Rental San Antonio TX | CRUMS Leasing",
    metaDescription: "Trailer rental in San Antonio, TX. Pick up at our Bulverde yard (30 min) or get delivery. 53' dry van & flatbed trailers. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in San Antonio, Texas",
    distanceFromBulverde: 30,
    isPickupFriendly: true,
    keyHighways: ["I-10", "I-35", "I-410", "US-281"],
    keyIndustries: ["Military logistics", "Healthcare distribution", "Aerospace", "Manufacturing"],
    nearbyAirports: ["SAT - San Antonio International"],
    regionalContext: "San Antonio is Texas's second-largest city and a major hub for military logistics with multiple bases including Joint Base San Antonio. The I-10 and I-35 corridors connect to major ports and distribution centers.",
    nearbyCities: ["austin-tx", "houston-tx"]
  },
  {
    city: "Austin",
    state: "Texas",
    stateAbbr: "TX",
    slug: "austin-tx",
    metaTitle: "Trailer Rental Austin TX | CRUMS Leasing",
    metaDescription: "Commercial trailer rental in Austin, TX. Easy pickup from Bulverde (1 hour) or delivery. Dry van, flatbed & reefer trailers available.",
    h1: "Trailer Rental & Leasing in Austin, Texas",
    distanceFromBulverde: 65,
    isPickupFriendly: true,
    keyHighways: ["I-35", "US-183", "US-290", "TX-130"],
    keyIndustries: ["Technology", "E-commerce fulfillment", "Food & beverage", "Construction"],
    nearbyAirports: ["AUS - Austin-Bergstrom International"],
    regionalContext: "Austin's booming tech sector and population growth have created high demand for freight and distribution services. The I-35 corridor connects Austin to major markets in Dallas and San Antonio.",
    nearbyCities: ["san-antonio-tx", "houston-tx", "dallas-tx"]
  },
  {
    city: "New Braunfels",
    state: "Texas",
    stateAbbr: "TX",
    slug: "new-braunfels-tx",
    metaTitle: "Trailer Rental New Braunfels TX | CRUMS Leasing",
    metaDescription: "Trailer rental in New Braunfels, TX - 20 min from our Bulverde HQ. Same-day pickup or delivery. Dry van & flatbed trailers.",
    h1: "Trailer Rental & Leasing in New Braunfels, Texas",
    distanceFromBulverde: 20,
    isPickupFriendly: true,
    keyHighways: ["I-35", "TX-46", "TX-337"],
    keyIndustries: ["Manufacturing", "Tourism", "Retail distribution", "Agriculture"],
    regionalContext: "New Braunfels is one of the fastest-growing cities in America, located perfectly between San Antonio and Austin on the I-35 corridor. Our Bulverde location is just 20 minutes away.",
    nearbyCities: ["san-antonio-tx", "austin-tx"]
  },
  // Texas - Major Markets (Delivery)
  {
    city: "Houston",
    state: "Texas",
    stateAbbr: "TX",
    slug: "houston-tx",
    metaTitle: "Trailer Rental Houston TX | CRUMS Leasing",
    metaDescription: "Trailer rental in Houston, TX. We deliver 53' dry van, flatbed & reefer trailers to the greater Houston area. Call 1-888-570-4564.",
    h1: "Trailer Rental & Leasing in Houston, Texas",
    distanceFromBulverde: 180,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-45", "I-69", "US-59", "TX-99 (Grand Parkway)"],
    keyIndustries: ["Oil & gas", "Petrochemical", "Port logistics", "Healthcare", "Aerospace"],
    nearbyAirports: ["IAH - George Bush Intercontinental", "HOU - William P. Hobby"],
    portAccess: "Port of Houston - largest port in Texas and one of the busiest in the nation",
    regionalContext: "Houston is the largest trucking market in Texas and one of the largest in the nation. The Port of Houston handles over 250 million tons of cargo annually, creating massive demand for trailer capacity.",
    nearbyCities: ["san-antonio-tx", "dallas-tx", "austin-tx"]
  },
  {
    city: "Dallas",
    state: "Texas",
    stateAbbr: "TX",
    slug: "dallas-tx",
    metaTitle: "Trailer Rental Dallas TX | Commercial Trailer Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Dallas, TX. We deliver commercial trailers to the DFW metroplex. Dry van, flatbed & reefer trailers with flexible lease terms.",
    h1: "Trailer Rental & Leasing in Dallas, Texas",
    distanceFromBulverde: 275,
    isPickupFriendly: false,
    keyHighways: ["I-35", "I-30", "I-20", "I-45", "US-75"],
    keyIndustries: ["Retail distribution", "E-commerce", "Technology", "Telecommunications", "Financial services"],
    nearbyAirports: ["DFW - Dallas/Fort Worth International", "DAL - Dallas Love Field"],
    regionalContext: "Dallas-Fort Worth is a major logistics hub and crossroads of America. The I-35 corridor connects to major markets in Mexico, and multiple interstates make DFW a natural distribution center.",
    nearbyCities: ["houston-tx", "austin-tx", "fort-worth-tx"]
  },
  {
    city: "Fort Worth",
    state: "Texas",
    stateAbbr: "TX",
    slug: "fort-worth-tx",
    metaTitle: "Trailer Rental Fort Worth TX | Dry Van & Flatbed | CRUMS Leasing",
    metaDescription: "Trailer leasing in Fort Worth, TX. Commercial trailers delivered to the DFW area. 53' dry van and flatbed trailers with flexible terms.",
    h1: "Trailer Rental & Leasing in Fort Worth, Texas",
    distanceFromBulverde: 280,
    isPickupFriendly: false,
    keyHighways: ["I-35W", "I-30", "I-20", "TX-121"],
    keyIndustries: ["Aerospace", "Defense", "Manufacturing", "Logistics", "Railroads"],
    nearbyAirports: ["DFW - Dallas/Fort Worth International", "AFW - Fort Worth Alliance"],
    regionalContext: "Fort Worth is a major logistics center with Alliance Texas, one of the largest inland ports in the nation. The city's strategic location makes it ideal for distribution operations.",
    nearbyCities: ["dallas-tx", "austin-tx", "houston-tx"]
  },
  // Major National Logistics Hubs
  {
    city: "Los Angeles",
    state: "California",
    stateAbbr: "CA",
    slug: "los-angeles-ca",
    metaTitle: "Trailer Rental Los Angeles CA | 53' Dry Van Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental & leasing in Los Angeles, CA. We deliver commercial trailers to Southern California. Serving the nation's largest trucking market.",
    h1: "Trailer Rental & Leasing in Los Angeles, California",
    distanceFromBulverde: 1350,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-5", "I-15", "I-110", "I-405"],
    keyIndustries: ["Port logistics", "Entertainment", "E-commerce", "Manufacturing", "Food distribution"],
    nearbyAirports: ["LAX - Los Angeles International", "ONT - Ontario International"],
    portAccess: "Port of Los Angeles & Port of Long Beach - busiest container port complex in the Western Hemisphere",
    regionalContext: "Los Angeles is the largest trucking market in the United States. The ports of LA and Long Beach handle nearly half of all containers entering the U.S., creating enormous demand for trailer capacity.",
    nearbyCities: ["phoenix-az", "denver-co"]
  },
  {
    city: "Chicago",
    state: "Illinois",
    stateAbbr: "IL",
    slug: "chicago-il",
    metaTitle: "Trailer Rental Chicago IL | Commercial Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Chicago, IL. We deliver 53' dry van, flatbed & reefer trailers to the greater Chicago area. Central US distribution hub.",
    h1: "Trailer Rental & Leasing in Chicago, Illinois",
    distanceFromBulverde: 1150,
    isPickupFriendly: false,
    keyHighways: ["I-90", "I-94", "I-55", "I-57", "I-80"],
    keyIndustries: ["Intermodal", "Manufacturing", "Food processing", "Retail distribution", "Financial services"],
    nearbyAirports: ["ORD - O'Hare International", "MDW - Midway International"],
    regionalContext: "Chicago is the freight capital of North America, where six of the seven major Class I railroads converge. The city handles more intermodal freight than any other location in the Western Hemisphere.",
    nearbyCities: ["indianapolis-in", "kansas-city-mo"]
  },
  {
    city: "Atlanta",
    state: "Georgia",
    stateAbbr: "GA",
    slug: "atlanta-ga",
    metaTitle: "Trailer Rental Atlanta GA | Dry Van & Flatbed Leasing | CRUMS Leasing",
    metaDescription: "Trailer leasing in Atlanta, GA. Commercial trailers delivered to the metro Atlanta area. Serving the Southeast's largest logistics hub.",
    h1: "Trailer Rental & Leasing in Atlanta, Georgia",
    distanceFromBulverde: 920,
    isPickupFriendly: false,
    keyHighways: ["I-85", "I-75", "I-20", "I-285"],
    keyIndustries: ["E-commerce", "Retail distribution", "Beverage", "Automotive", "Film production"],
    nearbyAirports: ["ATL - Hartsfield-Jackson Atlanta International"],
    regionalContext: "Atlanta is the logistics hub of the Southeast, where I-85, I-75, and I-20 converge. Hartsfield-Jackson is the world's busiest airport, and the region is home to major corporate headquarters.",
    nearbyCities: ["charlotte-nc", "nashville-tn", "memphis-tn"]
  },
  {
    city: "Memphis",
    state: "Tennessee",
    stateAbbr: "TN",
    slug: "memphis-tn",
    metaTitle: "Trailer Rental Memphis TN | FedEx Hub Area | CRUMS Leasing",
    metaDescription: "Trailer rental in Memphis, TN - America's distribution center. We deliver commercial trailers to the Memphis area. Near the FedEx SuperHub.",
    h1: "Trailer Rental & Leasing in Memphis, Tennessee",
    distanceFromBulverde: 680,
    isPickupFriendly: false,
    keyHighways: ["I-40", "I-55", "I-240"],
    keyIndustries: ["Logistics", "Distribution", "Medical devices", "Agriculture", "Manufacturing"],
    nearbyAirports: ["MEM - Memphis International (FedEx SuperHub)"],
    portAccess: "Port of Memphis - 4th largest inland port in the United States",
    regionalContext: "Memphis is America's Distribution Center, home to the FedEx SuperHub and one of the nation's largest inland ports. The city's central location makes it ideal for reaching 50% of the U.S. population within a day's drive.",
    nearbyCities: ["nashville-tn", "atlanta-ga", "dallas-tx"]
  },
  {
    city: "Phoenix",
    state: "Arizona",
    stateAbbr: "AZ",
    slug: "phoenix-az",
    metaTitle: "Trailer Rental Phoenix AZ | Southwest Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Phoenix, AZ. We deliver 53' dry van and flatbed trailers to the Phoenix metro area. Serving the fast-growing Southwest market.",
    h1: "Trailer Rental & Leasing in Phoenix, Arizona",
    distanceFromBulverde: 870,
    isPickupFriendly: false,
    keyHighways: ["I-10", "I-17", "I-40", "US-60"],
    keyIndustries: ["Semiconductor manufacturing", "Aerospace", "E-commerce", "Construction", "Agriculture"],
    nearbyAirports: ["PHX - Phoenix Sky Harbor International"],
    regionalContext: "Phoenix is one of the fastest-growing metros in the nation with booming semiconductor and manufacturing sectors. The I-10 corridor connects Phoenix to Los Angeles and Texas markets.",
    nearbyCities: ["los-angeles-ca", "denver-co"]
  },
  // Additional High-Volume Markets
  {
    city: "Indianapolis",
    state: "Indiana",
    stateAbbr: "IN",
    slug: "indianapolis-in",
    metaTitle: "Trailer Rental Indianapolis IN | Crossroads of America | CRUMS Leasing",
    metaDescription: "Trailer leasing in Indianapolis, IN - the Crossroads of America. We deliver commercial trailers to central Indiana. Ideal for Midwest distribution.",
    h1: "Trailer Rental & Leasing in Indianapolis, Indiana",
    distanceFromBulverde: 1050,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-65", "I-69", "I-74"],
    keyIndustries: ["Automotive", "Pharmaceutical", "Logistics", "Manufacturing", "Agriculture"],
    nearbyAirports: ["IND - Indianapolis International"],
    regionalContext: "Indianapolis is known as the Crossroads of America, where more interstate highways converge than any other U.S. city. The central location provides access to 75% of the U.S. population within a day's drive.",
    nearbyCities: ["chicago-il", "nashville-tn", "kansas-city-mo"]
  },
  {
    city: "Nashville",
    state: "Tennessee",
    stateAbbr: "TN",
    slug: "nashville-tn",
    metaTitle: "Trailer Rental Nashville TN | Commercial Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Nashville, TN. We deliver dry van and flatbed trailers to Middle Tennessee. Serving one of America's fastest-growing logistics markets.",
    h1: "Trailer Rental & Leasing in Nashville, Tennessee",
    distanceFromBulverde: 780,
    isPickupFriendly: false,
    keyHighways: ["I-40", "I-65", "I-24"],
    keyIndustries: ["Healthcare", "Automotive", "Music industry", "Logistics", "E-commerce"],
    nearbyAirports: ["BNA - Nashville International"],
    regionalContext: "Nashville is one of the fastest-growing cities in America with a booming logistics sector. The convergence of I-40, I-65, and I-24 makes it a strategic distribution point for the Southeast.",
    nearbyCities: ["memphis-tn", "atlanta-ga", "indianapolis-in"]
  },
  {
    city: "Charlotte",
    state: "North Carolina",
    stateAbbr: "NC",
    slug: "charlotte-nc",
    metaTitle: "Trailer Rental Charlotte NC | East Coast Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Charlotte, NC. Commercial trailers delivered to the Charlotte metro. Serving the East Coast's growing distribution market.",
    h1: "Trailer Rental & Leasing in Charlotte, North Carolina",
    distanceFromBulverde: 1100,
    isPickupFriendly: false,
    keyHighways: ["I-85", "I-77", "I-485"],
    keyIndustries: ["Banking", "Automotive", "E-commerce", "Food processing", "Energy"],
    nearbyAirports: ["CLT - Charlotte Douglas International"],
    regionalContext: "Charlotte is a major East Coast distribution hub on the I-85 corridor. The city's central East Coast location and strong infrastructure make it ideal for serving markets from Atlanta to Washington D.C.",
    nearbyCities: ["atlanta-ga", "nashville-tn"]
  },
  {
    city: "Denver",
    state: "Colorado",
    stateAbbr: "CO",
    slug: "denver-co",
    metaTitle: "Trailer Rental Denver CO | Mountain West Leasing | CRUMS Leasing",
    metaDescription: "Trailer rental in Denver, CO. We deliver commercial trailers to the Front Range. Gateway to the Mountain West with flexible leasing terms.",
    h1: "Trailer Rental & Leasing in Denver, Colorado",
    distanceFromBulverde: 930,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-25", "I-76", "US-36"],
    keyIndustries: ["Aerospace", "Technology", "Energy", "Outdoor recreation", "Food & beverage"],
    nearbyAirports: ["DEN - Denver International"],
    regionalContext: "Denver is the gateway to the Mountain West, serving as the primary distribution hub for the Rocky Mountain region. The I-70 and I-25 corridors connect Denver to major markets in all directions.",
    nearbyCities: ["phoenix-az", "kansas-city-mo"]
  },
  {
    city: "Kansas City",
    state: "Missouri",
    stateAbbr: "MO",
    slug: "kansas-city-mo",
    metaTitle: "Trailer Rental Kansas City MO | Central Freight Hub | CRUMS Leasing",
    metaDescription: "Trailer leasing in Kansas City, MO. Commercial trailers delivered to the KC metro. Central location for nationwide freight distribution.",
    h1: "Trailer Rental & Leasing in Kansas City, Missouri",
    distanceFromBulverde: 690,
    isPickupFriendly: false,
    keyHighways: ["I-70", "I-35", "I-29", "I-49"],
    keyIndustries: ["Intermodal", "Automotive", "Agriculture", "Manufacturing", "E-commerce"],
    nearbyAirports: ["MCI - Kansas City International"],
    regionalContext: "Kansas City is a major freight hub where I-70 and I-35 intersect, connecting major markets from coast to coast and border to border. The city is a growing intermodal and e-commerce fulfillment center.",
    nearbyCities: ["denver-co", "chicago-il", "dallas-tx", "indianapolis-in"]
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
  const southwest = locations.filter(loc => ["CA", "AZ"].includes(loc.stateAbbr));
  const midwest = locations.filter(loc => ["IL", "IN", "MO"].includes(loc.stateAbbr));
  const southeast = locations.filter(loc => ["GA", "TN", "NC"].includes(loc.stateAbbr));
  const mountain = locations.filter(loc => ["CO"].includes(loc.stateAbbr));
  
  return { texas, southwest, midwest, southeast, mountain };
};

// Get pickup-friendly locations
export const getPickupFriendlyLocations = (): LocationData[] => {
  return locations.filter(loc => loc.isPickupFriendly);
};
