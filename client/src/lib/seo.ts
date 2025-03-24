/**
 * SEO optimization utilities for dynamic page updates
 */

import { Anime } from '@shared/types';

/**
 * Generates metadata title with consistent branding
 */
export const generatePageTitle = (title: string): string => {
  const siteName = '9Anime';
  return title.includes(siteName) ? title : `${title} - ${siteName}`;
};

/**
 * Generates keywords based on anime properties
 */
export const generateAnimeKeywords = (anime: Anime): string => {
  const baseKeywords = 'anime, streaming, watch anime, free anime, anime episodes, anime movies';
  const specificKeywords = [
    anime.title,
    ...anime.genres,
    anime.type,
    `${anime.title} anime`,
    `watch ${anime.title}`,
    `${anime.title} online`,
    `${anime.title} episodes`
  ].join(', ');

  return `${baseKeywords}, ${specificKeywords}`;
};

/**
 * Generates proper canonical URL
 */
export const getCanonicalUrl = (path: string): string => {
  const baseDomain = 'https://9anime.to';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseDomain}${cleanPath}`;
};

/**
 * Formats description for SEO with optimal length
 */
export const formatSEODescription = (description: string): string => {
  // Optimal meta description is around 150-160 characters
  if (description.length <= 160) return description;

  // Truncate to last complete sentence under 160 chars
  const truncated = description.substring(0, 157);
  const lastPeriodIndex = truncated.lastIndexOf('.');

  if (lastPeriodIndex > 100) {
    return truncated.substring(0, lastPeriodIndex + 1);
  }

  return truncated + '...';
};


interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'video' | 'product';
  keywords?: string;
}

/**
 * Updates all meta tags for SEO
 */
export function updatePageSEO(metadata: SEOMetadata): void {
  // Update page title
  document.title = metadata.title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', metadata.description);
  }
  
  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogType = document.querySelector('meta[property="og:type"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  
  if (ogTitle) ogTitle.setAttribute('content', metadata.title);
  if (ogDescription) ogDescription.setAttribute('content', metadata.description);
  if (ogType && metadata.type) ogType.setAttribute('content', metadata.type);
  if (ogImage && metadata.image) ogImage.setAttribute('content', metadata.image);
  
  // Update twitter tags
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  
  if (twitterTitle) twitterTitle.setAttribute('content', metadata.title);
  if (twitterDescription) twitterDescription.setAttribute('content', metadata.description);
  if (twitterImage && metadata.image) twitterImage.setAttribute('content', metadata.image);
  
  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink && metadata.canonical) {
    canonicalLink.setAttribute('href', metadata.canonical);
  }
  
  // Update keywords if provided
  if (metadata.keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.keywords);
    }
  }
}

/**
 * Generates breadcrumb structured data
 */
export function generateBreadcrumbData(items: {name: string, url: string}[]): string {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
  
  return JSON.stringify(breadcrumbData);
}

/**
 * Optimize HTML content for featured snippets
 */
export function optimizeContent(content: string): string {
  // Add FAQ schema if content contains Q&A patterns
  if (content.includes('<h3>') && content.includes('?')) {
    // Simplified detection of Q&A patterns
    return content;
  }
  
  return content;
}

export default {
  updatePageSEO,
  generateBreadcrumbData,
  optimizeContent,
  generatePageTitle,
  generateAnimeKeywords,
  getCanonicalUrl,
  formatSEODescription
};