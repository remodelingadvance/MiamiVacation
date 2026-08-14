import { Helmet } from 'react-helmet-async';

const SEOHead = ({ title }) => {
  const fullTitle = title 
    ? `${title} | Stay Wise Miami Admin`
    : 'Admin Dashboard | Stay Wise Miami';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
};

export default SEOHead;
