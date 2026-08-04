import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import SEOHead from '../components/common/SEOHead';
import HeroSection from '../components/home/HeroSection';
import apiService from '../config/api';

const NatureExploreHero = lazy(() => import('../components/home/NatureExploreHero'));
const StatsSection = lazy(() => import('../components/home/StatsSection'));
const FeaturedProperties = lazy(() => import('../components/home/FeaturedProperties'));
const AboutStayWiseBanner = lazy(() => import('../components/home/AboutStayWiseBanner'));
const Amenities = lazy(() => import('../components/home/Amenities'));
const Testimonials = lazy(() => import('../components/home/Testimonials'));

const SectionFallback = ({ minHeight = 280 }) => (
  <div
    className="w-full bg-gradient-to-b from-white to-[#f5fbfc]"
    style={{ minHeight }}
    aria-hidden="true"
  />
);

const LazySection = ({ children, minHeight }) => {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return undefined;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '420px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref}>
      {shouldRender ? (
        <Suspense fallback={<SectionFallback minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        <SectionFallback minHeight={minHeight} />
      )}
    </div>
  );
};

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiService.getFeaturedProperties();
        setFeaturedProperties(response.data.properties);
      } catch (error) {
        console.error('Failed to fetch featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <>
      <SEOHead
        title="Luxury Vacation Rentals"
        description="Experience luxury living in Miami's finest vacation rentals. Oceanfront penthouses, modern condos, and exclusive villas."
        keywords="Miami vacation rentals, luxury condos Miami, Miami Beach rentals, vacation homes"
      />

      <HeroSection />

      <LazySection minHeight={560}>
        <NatureExploreHero />
      </LazySection>

      <LazySection minHeight={360}>
        <StatsSection />
      </LazySection>

      <LazySection minHeight={520}>
        <FeaturedProperties properties={featuredProperties} loading={loading} />
      </LazySection>

      <LazySection minHeight={520}>
        <AboutStayWiseBanner />
      </LazySection>

      <LazySection minHeight={520}>
        <Amenities />
      </LazySection>

      <LazySection minHeight={520}>
        <Testimonials />
      </LazySection>
    </>
  );
};

export default HomePage;
