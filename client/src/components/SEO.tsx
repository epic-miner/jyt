
import { Helmet } from 'react-helmet-async';
import { generatePageTitle, formatSEODescription, getCanonicalUrl } from '../lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  schema?: Record<string, any>; // For structured data
  noindex?: boolean;
}

export const SEO = ({
  title = '9Anime - Watch Anime Online',
  description = 'Watch your favorite anime online for free - High-quality streaming anime episodes, movies with English subtitles. HD quality and fast loading speed.',
  keywords = 'anime, streaming, watch anime, free anime, anime episodes, anime movies, HD anime, english subtitles, dubbed anime',
  image = '/images/logo.webp',
  url,
  schema,
  noindex = false,
}: SEOProps) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonicalUrl = url || getCanonicalUrl(currentPath);
  const fullTitle = generatePageTitle(title);
  const optimizedDescription = formatSEODescription(description);
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="9Anime" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card data */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language alternates */}
      <link rel="alternate" hreflang="en" href={canonicalUrl} />
      <link rel="alternate" hreflang="x-default" href={canonicalUrl} />
      
      {/* Structured data if provided */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
