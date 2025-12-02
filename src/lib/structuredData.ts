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
    "telephone": "+1-480-749-8996",
    "contactType": "Customer Service",
    "email": "info@crumsleasing.com",
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
  "telephone": "+1-480-749-8996",
  "email": "info@crumsleasing.com",
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
