import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiShieldCheck, HiStar, HiCalendar, HiLocationMarker } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import HeroSection from '../components/home/HeroSection';
import FeaturedProperties from '../components/home/FeaturedProperties';
import Amenities from '../components/home/Amenities';
import Testimonials from '../components/home/Testimonials';
import PromoSection from '../components/home/PromoSection';
import FAQ from '../components/home/FAQ';
import NewsletterSignup from '../components/home/NewsletterSignup';
import CTASection from '../components/home/CTASection';
import StatsSection from '../components/home/StatsSection';
import useApi from '../hooks/useApi';
import apiService from '../config/api';
import AboutBanner from '../components/home/AboutBanner';
import PropertyLocationSection from '../components/home/PropertyLocationSection';

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

      {/* Hero Section */}
      <HeroSection />

      <PropertyLocationSection />

      {/* Stats Section */}
      <StatsSection />

      <AboutBanner />

      {/* Featured Properties */}
      <section className="bg-[var(--color-bg-medium)] py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              Featured Luxury Properties
            </h2>
            <p className="section-subtitle mx-auto">
              Discover our hand-picked selection of premium vacation rentals in Miami's most desirable locations
            </p>
          </motion.div>

          <FeaturedProperties properties={featuredProperties} loading={loading} />

          <div className="text-center mt-10">
            <Link to="/properties" className="btn-outline inline-flex items-center gap-2">
              View All Properties
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <Amenities />

      {/* Promotional Section */}
      <PromoSection />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA Section */}
      <CTASection />
    </>
  );
};

export default HomePage;
