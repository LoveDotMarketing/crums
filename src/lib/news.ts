import mats2026Image from "@/assets/news/mats-2026-booth.png";

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
}

export const newsArticles: NewsArticle[] = [
  {
    slug: "mats-2026-crums-leasing-booth-38024",
    title: "CRUMS Leasing Returns to Mid-America Trucking Show 2026",
    description: "CRUMS Leasing exhibits at MATS 2026 in Louisville, KY at Booth #38024, showcasing trailer leasing services, fleet innovations, and networking with trucking industry professionals.",
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
    image: mats2026Image
  },
  {
    slug: "family-first-core-values-reaffirmation",
    title: "CRUMS Leasing Reaffirms Core Values: Family First",
    description: "Instagram post reinforces the company's foundation on family values from Eric Bledsoe's mother, highlighting hassle-free rentals and customer support as operations stabilize.",
    date: "September 9, 2025",
    sortDate: "2025-09-09",
    externalLinks: ["https://www.instagram.com/p/DOZeCBREvLx/"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly"
  },
  {
    slug: "mats-2025-debut-louisville",
    title: "CRUMS Leasing Debuts at Mid-America Trucking Show 2025",
    description: "CRUMS Leasing exhibits at North America's largest trucking event in Louisville, KY, showcasing its fleet, networking, and promoting driver-friendly leasing options.",
    date: "March 27–29, 2025",
    sortDate: "2025-03-27",
    externalLinks: ["https://truckingshow.com/"],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "yearly"
  },
  {
    slug: "major-launch-texas-expansion-march-2025",
    title: "CRUMS Leasing Announces Major Launch and Texas Expansion",
    description: "Multiple press releases announce CRUMS Leasing's official market entry with GPS-equipped trailers in Texas hubs including Laredo, San Antonio, Houston, and Austin with flexible terms.",
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
    changefreq: "yearly"
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
    changefreq: "yearly"
  },
  {
    slug: "official-industry-entry-announcement",
    title: "CRUMS Leasing Makes Official Industry Entry Announcement",
    description: "News article announces Eric Bledsoe's leap into trailer leasing with CRUMS, offering no-credit-check GPS-equipped 53' dry vans, inspired by family and aimed at empowering drivers.",
    date: "February 13, 2025",
    sortDate: "2025-02-13",
    externalLinks: ["https://www.truckpartsandservice.com/trucks-trailers/trailers/article/15737375/nba-star-leaps-into-trailer-leasing-business"],
    lastModified: "2025-12-10",
    priority: 0.8,
    changefreq: "yearly"
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
    changefreq: "yearly"
  },
  {
    slug: "new-year-launch-tease-texas-focus",
    title: "New Year Launch Tease and Texas Focus",
    description: "Instagram reel celebrates the new year from the San Antonio/Bulverde headquarters, teasing promotions and reliable rentals for Texas truckers as part of initial market entry.",
    date: "January 1, 2025",
    sortDate: "2025-01-01",
    externalLinks: ["https://www.instagram.com/reel/DETJQYoSg92/"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly"
  },
  {
    slug: "eric-bledsoe-shanghai-sharks-contract-extension",
    title: "Eric Bledsoe Signs Contract Extension with Shanghai Sharks Amid Business Growth",
    description: "Eric Bledsoe re-signs with the CBA's Shanghai Sharks, showcasing his ability to balance pro basketball overseas with scaling CRUMS Leasing in the U.S.",
    date: "November 23, 2024",
    sortDate: "2024-11-23",
    externalLinks: ["https://www.nationofblue.com/eric-bledsoe-reportedly-re-signs-with-the-shanghai-sharks/"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly"
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
    changefreq: "yearly"
  },
  {
    slug: "founder-spotlight-public-introduction",
    title: "Founder Spotlight: Public Introduction of CRUMS Leasing Vision",
    description: "Instagram post introduces Eric Bledsoe as founder, detailing his NBA transition to entrepreneurship and the company's mission for affordable, reliable trailer leasing inspired by his mother.",
    date: "November 1, 2024",
    sortDate: "2024-11-01",
    externalLinks: ["https://www.instagram.com/p/DB1_Ew0zP0K/"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly"
  },
  {
    slug: "promotional-debut-meet-greet-basketball-tournament",
    title: "Promotional Debut: Meet & Greet at Basketball Tournament",
    description: "Eric Bledsoe hosts a meet-and-greet at a basketball tournament to promote CRUMS Leasing, blending his sports background with business networking in the trucking space.",
    date: "July 19, 2024",
    sortDate: "2024-07-19",
    externalLinks: ["https://x.com/thetournament/status/1814413634615030091"],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly"
  },
  {
    slug: "first-public-tease-fleet-preview",
    title: "First Public Tease: Fleet Preview with \"CRUMS\"",
    description: "Eric Bledsoe shares a LinkedIn photo of his mother with a 2024 Great Dane trailer, hinting at the upcoming launch and emphasizing family roots in the trucking business.",
    date: "July 2, 2024",
    sortDate: "2024-07-02",
    externalLinks: ["https://www.linkedin.com/posts/eric-bledsoe-6083336a_crums-with-one-of-the-2024-great-danes-crums-activity-7213884559686295552-JBxY"],
    lastModified: "2025-12-10",
    priority: 0.7,
    changefreq: "yearly"
  },
  {
    slug: "conception-early-planning",
    title: "CRUMS Leasing: Conception and Early Planning",
    description: "Eric Bledsoe begins developing the idea for CRUMS Leasing as his first major entrepreneurial venture post-NBA, naming it after his mother \"CRUMS\" to honor family values and support for truckers.",
    date: "Mid-2024",
    sortDate: "2024-06-01",
    externalLinks: [],
    lastModified: "2025-12-10",
    priority: 0.6,
    changefreq: "yearly"
  }
];

// Helper to get article by slug
export const getArticleBySlug = (slug: string): NewsArticle | undefined => {
  return newsArticles.find(article => article.slug === slug);
};

// Generate NewsArticle schema for SEO
export const generateNewsArticleSchema = (article: NewsArticle) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.title,
  "description": article.description,
  "datePublished": article.sortDate,
  "dateModified": article.lastModified,
  "author": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "url": "https://crumsleasing.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CRUMS Leasing",
    "logo": {
      "@type": "ImageObject",
      "url": "https://crumsleasing.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://crumsleasing.com/news/${article.slug}`
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
