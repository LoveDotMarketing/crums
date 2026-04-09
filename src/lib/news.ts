const mats2026Image = "/images/crums-leasing-mats-convention-01.webp";
const chamberLogo = "/images/news/san-antonio-chamber-logo.png";

export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  sortDate: string; // ISO format for sorting
  externalLinks: string[];
  lastModified: string;
  priority: number;
  changefreq: string;
  image?: string; // Optional featured image
  articleSection?: string; // Category for schema
}

export const newsArticles: NewsArticle[] = [
  {
    slug: "mats-2026-expo-floor-walkthrough",
    title: "CRUMS Leasing at MATS 2026: Full Expo Floor Walkthrough",
    description: "CRUMS had a great time at the MATS 2026 expo. We had fun meeting and greeting visitors at our booth. Here is a full walkthrough video in 360 of the expo floor.",
    date: "April 9, 2026",
    sortDate: "2026-04-09",
    externalLinks: [
      "https://youtu.be/i2N3mUtS2wU?si=H8zcs7tg9N9L2OYB",
      "https://truckingshow.com/"
    ],
    lastModified: "2026-04-09",
    priority: 0.9,
    changefreq: "monthly",
    image: mats2026Image,
    articleSection: "Events"
  },
  {
    slug: "crums-leasing-joins-greater-san-antonio-chamber-of-commerce",
    title: "CRUMS Leasing Joins San Antonio Chamber of Commerce",
    description: "CRUMS Leasing announces membership in The Greater San Antonio Chamber of Commerce, reinforcing our commitment to local business and economic growth.",
    date: "January 29, 2026",
    sortDate: "2026-01-29",
    externalLinks: [
      "https://www.sachamber.org/"
    ],
    lastModified: "2026-01-29",
    priority: 0.9,
    changefreq: "monthly",
    image: chamberLogo,
    articleSection: "Company News"
  },
  {
    slug: "mats-2026-crums-leasing-booth-38024",
    title: "CRUMS Leasing Returns to Mid-America Trucking Show 2026",
    description: "CRUMS Leasing exhibits at MATS 2026 in Louisville, KY at Booth #38024, showcasing trailer leasing services and networking with industry pros.",
    date: "March 26–28, 2026",
    sortDate: "2026-03-26",
    externalLinks: [
      "https://mats2026.smallworldlabs.com/co/crums-leasing",
      "https://s19.a2zinc.net/clients/EMA/MATS2026/Public/EventMap.aspx?EventId=3&MapItBoothID=104588&MapItBooth=38024&MapID=5",
      "https://truckingshow.com/",
      "https://truckingshow.com/docs/exhibitor/where-is-my-booth-located/",
      "https://truckingshow.com/media-event-info/"
    ],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "monthly",
    image: mats2026Image,
    articleSection: "Events"
  },
  {
    slug: "family-first-core-values-reaffirmation",
    title: "CRUMS Leasing Reaffirms Core Values: Family First",
    description: "Instagram post reinforces the company's family values foundation, highlighting hassle-free rentals and customer support as operations stabilize.",
    date: "September 9, 2025",
    sortDate: "2025-09-09",
    externalLinks: ["https://www.instagram.com/p/DOZeCBREvLx/"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Company Culture"
  },
  {
    slug: "mats-2025-debut-louisville",
    title: "CRUMS Leasing Debuts at Mid-America Trucking Show 2025",
    description: "CRUMS Leasing exhibits at North America's largest trucking event in Louisville, KY, showcasing its fleet and driver-friendly leasing options.",
    date: "March 27–29, 2025",
    sortDate: "2025-03-27",
    externalLinks: ["https://truckingshow.com/"],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "yearly",
    articleSection: "Events"
  },
  {
    slug: "major-launch-texas-expansion-march-2025",
    title: "CRUMS Leasing Announces Major Launch and Texas Expansion",
    description: "Press releases announce CRUMS Leasing's market entry with GPS-equipped trailers in Texas hubs: Laredo, San Antonio, Houston, and Austin.",
    date: "March 24, 2025",
    sortDate: "2025-03-24",
    externalLinks: [
      "https://www.prnewswire.com/news-releases/eric-bledsoe-breaks-into-trailer-leasing-industry-302085283.html",
      "https://finance.yahoo.com/news/eric-bledsoe-breaks-trailer-leasing-151500586.html",
      "https://patch.com/tennessee/across-tn/eric-bledsoe-breaks-trailer-leasing-industry",
      "https://www.truckinginfo.com/10194823/eric-bledsoe-launches-trailer-leasing-company",
      "https://www.freightwaves.com/news/nba-star-eric-bledsoe-launches-trailer-leasing-company"
    ],
    lastModified: "2025-12-10",
    priority: 0.9,
    changefreq: "yearly",
    articleSection: "Press Release"
  },
  {
    slug: "10-4-magazine-feature-february-2025",
    title: "CRUMS Leasing Featured in 10-4 Magazine",
    description: "10-4 Magazine profiles the company's founding story, Eric Bledsoe's NBA background, and commitment to hard work, with photos and details on leasing solutions.",
    date: "February 2025",
    sortDate: "2025-02-15",
    externalLinks: [
      "https://www.tenfourmagazine.com/content/2025/05/show-reports/mats-makes-moves/"
    ],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "yearly",
    articleSection: "Media Coverage"
  },
  {
    slug: "official-industry-entry-announcement",
    title: "CRUMS Leasing Makes Official Industry Entry Announcement",
    description: "News article announces Eric Bledsoe's leap into trailer leasing with GPS-equipped 53' dry vans, inspired by family values.",
    date: "February 13, 2025",
    sortDate: "2025-02-13",
    externalLinks: ["https://www.truckpartsandservice.com/trucks-trailers/trailers/article/15737375/nba-star-leaps-into-trailer-leasing-business"],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "yearly",
    articleSection: "Media Coverage"
  },
  {
    slug: "texas-truckers-giveaway-promotion",
    title: "Texas Truckers Giveaway Promotion Concludes",
    description: "Final day of a promotional giveaway targeting Texas haulers, offering free leasing weeks and prizes to build local buzz and support independent operators.",
    date: "January 30, 2025",
    sortDate: "2025-01-30",
    externalLinks: ["https://www.instagram.com/crumsleasingllc/reel/DFeGOEAyGbI/"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Promotions"
  },
  {
    slug: "new-year-launch-tease-texas-focus",
    title: "New Year Launch Tease and Texas Focus",
    description: "Instagram reel celebrates the new year from San Antonio headquarters, teasing promotions and reliable rentals for Texas carriers.",
    date: "January 1, 2025",
    sortDate: "2025-01-01",
    externalLinks: ["https://www.instagram.com/reel/DETJQYoSg92/"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Company News"
  },
  {
    slug: "eric-bledsoe-shanghai-sharks-contract-extension",
    title: "Eric Bledsoe Re-Signs with Shanghai Sharks",
    description: "Eric Bledsoe re-signs with the CBA's Shanghai Sharks, balancing pro basketball overseas with scaling CRUMS Leasing in the U.S.",
    date: "November 23, 2024",
    sortDate: "2024-11-23",
    externalLinks: ["https://www.nationofblue.com/eric-bledsoe-reportedly-re-signs-with-the-shanghai-sharks/"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly",
    articleSection: "Founder News"
  },
  {
    slug: "recognition-dual-career-path",
    title: "Recognition of Eric Bledsoe's Dual Career Path",
    description: "LinkedIn post honors Eric Bledsoe's dedication, linking his NBA drive to building CRUMS Leasing as a customer-focused venture.",
    date: "November 4, 2024",
    sortDate: "2024-11-04",
    externalLinks: ["https://www.linkedin.com/posts/eric-bledsoe-6083336a_honored-activity-7259414157215563776-2KJL"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Founder News"
  },
  {
    slug: "founder-spotlight-public-introduction",
    title: "Founder Spotlight: Eric Bledsoe Introduces CRUMS Leasing",
    description: "Instagram post introduces Eric Bledsoe as founder, detailing his NBA transition to entrepreneurship and the company's mission.",
    date: "November 1, 2024",
    sortDate: "2024-11-01",
    externalLinks: ["https://www.instagram.com/p/DB1_Ew0zP0K/"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly",
    articleSection: "Founder News"
  },
  {
    slug: "promotional-debut-meet-greet-basketball-tournament",
    title: "Promotional Debut: Meet & Greet at Basketball Tournament",
    description: "Eric Bledsoe hosts a meet-and-greet at a basketball tournament to promote CRUMS Leasing, blending sports and business networking.",
    date: "July 19, 2024",
    sortDate: "2024-07-19",
    externalLinks: ["https://x.com/thetournament/status/1814413634615030091"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Events"
  },
  {
    slug: "first-public-tease-fleet-preview",
    title: "First Public Tease: Fleet Preview with \"CRUMS\"",
    description: "Eric Bledsoe shares a LinkedIn photo of his mother with a 2024 Great Dane trailer, hinting at the launch and family roots.",
    date: "July 2, 2024",
    sortDate: "2024-07-02",
    externalLinks: ["https://www.linkedin.com/posts/eric-bledsoe-6083336a_crums-with-one-of-the-2024-great-danes-crums-activity-7213884559686295552-JBxY"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly",
    articleSection: "Company News"
  },
  {
    slug: "conception-early-planning",
    title: "CRUMS Leasing: Conception and Early Planning",
    description: "Eric Bledsoe develops the idea for CRUMS Leasing post-NBA, naming it after his mother to honor family values and carriers.",
    date: "Mid-2024",
    sortDate: "2024-06-01",
    externalLinks: [],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly",
    articleSection: "Company History"
  }
];

// Helper to get article by slug
export const getArticleBySlug = (slug: string): NewsArticle | undefined => {
  return newsArticles.find(article => article.slug === slug);
};

// Social media profiles for publisher
const socialProfiles = [
  "https://www.instagram.com/crumsleasingllc/",
  "https://www.linkedin.com/company/crums-leasing/",
  "https://www.facebook.com/crumsleasing",
  "https://x.com/crumsleasing"
];

// Generate NewsArticle schema for SEO
export const generateNewsArticleSchema = (article: NewsArticle) => {
  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.sortDate,
    "dateModified": article.lastModified,
    "url": `https://crumsleasing.com/news/${article.slug}`,
    "author": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CRUMS Leasing",
      "url": "https://crumsleasing.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://crumsleasing.com/images/pub-logo-112.webp",
        "width": 112,
        "height": 112
      },
      "sameAs": socialProfiles
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://crumsleasing.com/news/${article.slug}`
    }
  };

  // Add image if available
  if (article.image) {
    baseSchema.image = {
      "@type": "ImageObject",
      "url": `https://crumsleasing.com${article.image}`,
      "width": 1200,
      "height": 630
    };
  }

  // Add article section if available
  if (article.articleSection) {
    baseSchema.articleSection = article.articleSection;
  }

  return baseSchema;
};

// Generate Event schema for MATS 2026
export const generateMats2026EventSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Mid-America Trucking Show 2026",
  "description": "MATS 2026 is the largest annual heavy-duty trucking industry event in North America. CRUMS Leasing will be exhibiting at Booth #38024 in the South Wing.",
  "startDate": "2026-03-26",
  "endDate": "2026-03-28",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Kentucky Expo Center",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "937 Phillips Lane",
      "addressLocality": "Louisville",
      "addressRegion": "KY",
      "postalCode": "40209",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.1925,
      "longitude": -85.7419
    }
  },
  "image": "https://crumsleasing.com/images/crums-leasing-mats-convention-01.webp",
  "organizer": {
    "@type": "Organization",
    "name": "Mid-America Trucking Show",
    "url": "https://truckingshow.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/images/news/mats-logo.webp"
    }
  },
  "performer": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/images/pub-logo-112.webp",
      "width": 112,
      "height": 112
    },
    "description": "CRUMS Leasing - Exhibitor at Booth #38024"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://truckingshow.com/",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-12-01",
    "description": "Free attendee registration available until February 26, 2026"
  }
});

// Generate ItemList schema for news listing page
export const generateNewsListSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "CRUMS Leasing News & Updates",
  "description": "Latest news, announcements, and milestones from CRUMS Leasing",
  "numberOfItems": newsArticles.length,
  "itemListElement": newsArticles.map((article, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://crumsleasing.com/news/${article.slug}`,
    "name": article.title
  }))
});
