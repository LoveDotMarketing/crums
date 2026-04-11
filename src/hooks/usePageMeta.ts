import { useEffect } from "react";

interface ArticleMeta {
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  author?: string;
}

interface UsePageMetaOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  article?: ArticleMeta;
}

const SITE_ORIGIN = "https://crumsleasing.com";
const SITE_NAME = "CRUMS Leasing";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url, SITE_ORIGIN);
    let path = parsed.pathname;

    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return `${parsed.origin}${path}`;
  } catch {
    return url;
  }
};

const toAbsoluteUrl = (url: string): string => {
  try {
    return new URL(url, SITE_ORIGIN).toString();
  } catch {
    return `${SITE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  }
};

const formatTitle = (title: string): string => {
  const hasBrand = /crum'?s?/i.test(title);
  return hasBrand ? title : `${title} | ${SITE_NAME}`;
};

const ensureTitleElement = () => {
  let titleElement = document.head.querySelector("title");

  if (!titleElement) {
    titleElement = document.createElement("title");
    document.head.appendChild(titleElement);
  }

  return titleElement;
};

const upsertMetaTag = (attribute: "name" | "property", key: string, content?: string) => {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  const element = existing ?? document.createElement("meta");
  element.setAttribute(attribute, key);
  element.setAttribute("content", content);
  element.setAttribute("data-page-meta", "true");

  if (!existing) {
    document.head.appendChild(element);
  }
};

const upsertCanonicalLink = (href: string) => {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const element = existing ?? document.createElement("link");

  element.setAttribute("rel", "canonical");
  element.setAttribute("href", href);
  element.setAttribute("data-page-meta", "true");

  if (!existing) {
    document.head.appendChild(element);
  }
};

export const usePageMeta = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  article,
}: UsePageMetaOptions) => {
  useEffect(() => {
    const fullTitle = formatTitle(title);
    const canonicalUrl = canonical
      ? normalizeUrl(canonical)
      : normalizeUrl(`${SITE_ORIGIN}${window.location.pathname}`);
    const imageUrl = toAbsoluteUrl(ogImage);
    const robotsContent = noindex ? "noindex, nofollow" : "index, follow";
    const ogType = article ? "article" : "website";

    document.title = fullTitle;
    ensureTitleElement().textContent = fullTitle;

    upsertCanonicalLink(canonicalUrl);

    upsertMetaTag("name", "description", description);
    upsertMetaTag("name", "robots", robotsContent);
    upsertMetaTag("property", "og:title", fullTitle);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:image", imageUrl);
    upsertMetaTag("property", "og:image:width", "1200");
    upsertMetaTag("property", "og:image:height", "630");
    upsertMetaTag("property", "og:type", ogType);
    upsertMetaTag("property", "og:site_name", SITE_NAME);
    upsertMetaTag("property", "og:locale", "en_US");
    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", fullTitle);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", imageUrl);
    upsertMetaTag("name", "twitter:site", "@crumsleasing");
    upsertMetaTag("property", "article:published_time", article?.publishedTime);
    upsertMetaTag("property", "article:modified_time", article?.modifiedTime);
    upsertMetaTag("property", "article:section", article?.section);
    upsertMetaTag("property", "article:author", article?.author);
  }, [
    article?.author,
    article?.modifiedTime,
    article?.publishedTime,
    article?.section,
    canonical,
    description,
    noindex,
    ogImage,
    title,
  ]);
};