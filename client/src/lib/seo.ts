
/**
 * SEO optimization utilities for dynamic page updates
 */

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
  optimizeContent
};
