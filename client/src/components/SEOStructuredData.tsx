
import React from 'react';
import { Anime } from '@shared/types';

interface WebsiteStructuredDataProps {
  url: string;
}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = ({ url }) => {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': '9Anime - Watch Anime Online',
    'url': url,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
};

interface AnimeStructuredDataProps {
  anime: Anime;
  url: string;
}

export const AnimeStructuredData: React.FC<AnimeStructuredDataProps> = ({ anime, url }) => {
  const animeData = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    'name': anime.title,
    'description': anime.description,
    'image': anime.coverImage,
    'url': `${url}/anime/${anime.id}`,
    'genre': anime.genres,
    'datePublished': anime.releaseDate,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': anime.rating,
      'bestRating': '10',
      'worstRating': '1',
      'ratingCount': anime.ratingCount
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(animeData) }}
    />
  );
};

export default { WebsiteStructuredData, AnimeStructuredData };
