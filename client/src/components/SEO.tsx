
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO = ({
  title = 'AnimeStream - Watch Anime Online',
  description = 'Watch your favorite anime online - Free streaming anime episodes, movies with English subtitles',
  keywords = 'anime, streaming, watch anime, free anime, anime episodes, anime movies',
  image = '/favicon.jpg',
  url,
}: SEOProps) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteTitle = "AnimeStream";
  const fullTitle = title.includes(siteTitle) ? title : `${title} - ${siteTitle}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={currentUrl} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};
