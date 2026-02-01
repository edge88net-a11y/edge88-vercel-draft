import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  titleTemplate?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const BASE_URL = 'https://edge88.net';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function SEOHead({
  title,
  titleTemplate = '%s | Edge88',
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
}: SEOHeadProps) {
  const { language } = useLanguage();
  
  const defaultTitle = language === 'cz' 
    ? 'Edge88 | AI Sportovní Predikce - NHL, NBA, Fotbal, UFC'
    : 'Edge88 | AI Sports Predictions - NHL, NBA, Soccer, UFC';
    
  const defaultDescription = language === 'cz'
    ? 'AI predikce sportovních zápasů s 71% přesností. Denní tipy pro NHL, NBA, fotbal a UFC. Připojte se k 500+ uživatelům profitujícím z datové analýzy.'
    : 'AI-powered sports predictions with 71% accuracy. Get daily picks for NHL, NBA, soccer, and UFC. Join 500+ users profiting from data-driven analysis.';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  
  // JSON-LD structured data for organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Edge88',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: finalDescription,
    sameAs: [
      'https://t.me/edge88picks',
      'https://twitter.com/edge88picks',
    ],
  };

  // JSON-LD for website
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Edge88',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/predictions?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title ? titleTemplate.replace('%s', title) : finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={finalUrl} />
      <meta httpEquiv="content-language" content={language === 'cz' ? 'cs' : 'en'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={language === 'cz' ? 'cs_CZ' : 'en_US'} />
      <meta property="og:site_name" content="Edge88" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@edge88picks" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
}
