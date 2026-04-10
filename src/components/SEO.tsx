import { Helmet } from "react-helmet-async";
import { useStructuredData } from "@/hooks/useStructuredData";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  // Article-specific Open Graph properties
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    author?: string;
  };
}

export const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage = "/og-image.jpg",
  structuredData,
  noindex = false,
  article
}: SEOProps) => {
  // Inject JSON-LD directly into DOM instead of via Helmet to avoid conflicts
  useStructuredData(structuredData);
  const fullTitle = `${title} | CRUMS Leasing`;
  
  // Normalize canonical URL - remove trailing slashes except for root, handle query params
  const normalizeUrl = (url: string): string => {
    try {
      const parsed = new URL(url);
      // Remove query params and hash for canonical
      let path = parsed.pathname;
      // Remove trailing slash unless it's the root
      if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return `${parsed.origin}${path}`;
    } catch {
      return url;
    }
  };
  
  const canonicalUrl = canonical 
    ? normalizeUrl(canonical)
    : normalizeUrl(`https://crumsleasing.com${window.location.pathname}`);

  // Determine og:type based on whether article metadata is provided
  const ogType = article ? "article" : "website";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots directive */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`https://crumsleasing.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="CRUMS Leasing" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific Open Graph tags */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://crumsleasing.com${ogImage}`} />
      <meta name="twitter:site" content="@crumsleasing" />
      
    </Helmet>
  );
};
