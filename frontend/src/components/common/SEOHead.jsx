import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../../config/constants';

const DEFAULT_OG_IMAGE = '/images/stay-wise-hero.png';

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const getAbsoluteUrl = (value, baseUrl) => {
  if (!value) return baseUrl;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noIndex = false,
  structuredData,
}) => {
  const location = useLocation();
  const baseUrl = stripTrailingSlash(APP_CONFIG.url);
  const path = location.pathname === '/' ? '/' : location.pathname;

  const fullTitle = title
    ? `${title} | ${APP_CONFIG.name}`
    : `${APP_CONFIG.name} - ${APP_CONFIG.description}`;

  const fullDescription = description || APP_CONFIG.description;
  const fullUrl = getAbsoluteUrl(url || path, baseUrl);
  const fullImage = getAbsoluteUrl(image || DEFAULT_OG_IMAGE, baseUrl);
  const robots = noIndex
    ? 'noindex,nofollow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  const schemaItems = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: APP_CONFIG.name,
      description: APP_CONFIG.description,
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/properties?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: APP_CONFIG.name,
      url: baseUrl,
      logo: getAbsoluteUrl('/stay-wise-fab-logo.png', baseUrl),
      email: APP_CONFIG.email,
      telephone: APP_CONFIG.phoneHref,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1717 N Bayshore Dr. Ste R217',
        addressLocality: 'Miami',
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    ...(Array.isArray(structuredData)
      ? structuredData
      : structuredData
        ? [structuredData]
        : []),
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="robots" content={robots} />
      {keywords && <meta name="keywords" content={keywords} />}

      <link rel="canonical" href={fullUrl} />

      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={APP_CONFIG.name} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      <script type="application/ld+json">
        {JSON.stringify(schemaItems)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
