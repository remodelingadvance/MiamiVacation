import { Helmet } from 'react-helmet-async';

const SEOHead = ({ title }) => {
  const fullTitle = title 
    ? `${title} | MLR Admin`
    : 'Admin Dashboard | Miami Luxury Rentals';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
};

export default SEOHead;