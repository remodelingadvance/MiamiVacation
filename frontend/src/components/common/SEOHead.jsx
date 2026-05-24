import { Helmet } from 'react-helmet-async';
import { APP_CONFIG } from '../../config/constants';

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  keywords,
}) => {
  const fullTitle = title 
    ? `${title} | ${APP_CONFIG.name}`
    : `${APP_CONFIG.name} - ${APP_CONFIG.description}`;

  const fullDescription = description || APP_CONFIG.description;
  const fullImage = image || '/og-image.jpg';
  const fullUrl = url || APP_CONFIG.url;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: APP_CONFIG.name,
          description: APP_CONFIG.description,
          url: APP_CONFIG.url,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${APP_CONFIG.url}/properties?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;