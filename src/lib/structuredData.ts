// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CRUMS Leasing",
  "legalName": "CRUMS Leasing LLC",
  "url": "https://crumsleasing.com",
  "logo": "https://crumsleasing.com/logo.png",
  "description": "Family-owned trailer leasing company offering quality 53-foot dry van trailers and flatbed leasing & rental solutions with nationwide service.",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4070 FM1863",
    "addressLocality": "Bulverde",
    "addressRegion": "TX",
    "postalCode": "78163",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-888-570-4564",
    "contactType": "Customer Service",
    "areaServed": "US",
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://www.facebook.com/people/Crums-Leasing/100090574399864/",
    "https://www.instagram.com/crumsleasingllc/",
    "https://www.linkedin.com/company/crums-leasing/"
  ]
};

// LocalBusiness Schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://crumsleasing.com/#localbusiness",
  "name": "CRUMS Leasing",
  "image": "https://crumsleasing.com/og-image.jpg",
  "url": "https://crumsleasing.com",
  "telephone": "+1-888-570-4564",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4070 FM1863",
    "addressLocality": "Bulverde",
    "addressRegion": "TX",
    "postalCode": "78163",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 29.7476761,
    "longitude": -98.41197869999999
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:00",
      "closes": "16:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  }
};

// Service Schema - Trailer Leasing
export const trailerLeasingServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Trailer Leasing",
  "provider": {
    "@type": "Organization",
    "name": "CRUMS Leasing"
  },
  "description": "53-foot dry van and flatbed trailer leasing with flexible terms starting at 12 months. Quality equipment, nationwide coverage, and 24/7 support.",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
};

// Service Schema - Trailer Rentals
export const trailerRentalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Trailer Rental",
  "provider": {
    "@type": "Organization",
    "name": "CRUMS Leasing"
  },
  "description": "Short-term 53-foot dry van and flatbed trailer rentals with fast availability and flexible rental periods.",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
};

// BreadcrumbList Schema Generator
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Customer Reviews Data
export const customerReviews = [
  {
    author: "Jessica Arden",
    rating: 5,
    date: "2025-12-03",
    text: "The owners of CRUMS Leasing are dedicated to providing value and exceptional service to trucking professionals throughout Texas. By providing flexible leasing options and GPS-equipped trailers that been meticulously maintained the company is supporting trucking professionals, and ultimately consumers across the region all benefit. Great leadership with a focus on excellence, definitely look into CRUMS Leasing next time you're in the market!"
  },
  {
    author: "Chlo Rayne",
    rating: 5,
    date: "2025-12-03",
    text: "If I could give more than 5 stars I would. CRUMS Leasing company was so great to work with, the trailers are nice and the size was perfect! The professionalism on their end was beyond. Thank you again. Will continue to look forward to working with them again."
  },
  {
    author: "Taylor Holguin",
    rating: 5,
    date: "2025-12-03",
    text: "I had an excellent experience with CRUMS Leasing company. From the beginning they were incredibly easy to work with! Professional, responsive, and genuinely focused on helping me find exactly what I needed. The entire process was smooth and hassle-free. The trailers themselves are in great condition! Clean, well-maintained, and clearly built to last. You can tell they take pride in the quality of their equipment. Overall, I'm extremely satisfied and wouldn't hesitate to lease from them again. Highly recommended!"
  }
];

// Review Schema Generator
export const generateReviewSchema = (reviews: typeof customerReviews) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CRUMS Leasing",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": reviews.length.toString(),
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "datePublished": review.date,
    "reviewBody": review.text,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  }))
});
