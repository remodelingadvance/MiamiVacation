import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiShieldCheck, HiStar, HiCalendar, HiLocationMarker } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import HeroSection from '../components/home/HeroSection';
import FeaturedProperties from '../components/home/FeaturedProperties';
import Amenities from '../components/home/Amenities';
import Testimonials from '../components/home/Testimonials';
import NewsletterSignup from '../components/home/NewsletterSignup';
import StatsSection from '../components/home/StatsSection';
import useApi from '../hooks/useApi';
import apiService from '../config/api';
// import PropertyLocationSection from '../components/home/PropertyLocationSection';
import AboutStayWiseBanner from '../components/home/AboutStayWiseBanner';
import NatureExploreHero from '../components/home/NatureExploreHero';

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
      <NatureExploreHero />

      {/* <PropertyLocationSection /> */}

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Properties */}

      <FeaturedProperties properties={featuredProperties} loading={loading} />

      <AboutStayWiseBanner />

      {/* Amenities Section */}
      <Amenities />

      {/* Testimonials */}
      <Testimonials />
    </>
  );
};

export default HomePage;
