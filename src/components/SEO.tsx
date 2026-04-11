import { useStructuredData } from "@/hooks/useStructuredData";
import { usePageMeta } from "@/hooks/usePageMeta";

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
  useStructuredData(structuredData);
  usePageMeta({
    title,
    description,
    canonical,
    ogImage,
    noindex,
    article,
  });

  return null;
};
