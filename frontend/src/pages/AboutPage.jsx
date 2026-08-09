import SEOHead from '../components/common/SEOHead';
import About from '../components/about/About';
import AboutHero from '../components/about/AboutHero';
import OurStory from '../components/about/OurStory';
import RealEstateBanner from '../components/about/RealEstateBanner';
import WhyChooseUs from '../components/about/WhyChooseUs';

const AboutPage = () => {
  return (
    <>
      <SEOHead
        title="About Stay Wise"
        description="Learn about Stay Wise, a Miami-based luxury vacation rental platform offering handpicked stays, local concierge care, and premium booking support."
        keywords="about Stay Wise, Miami vacation rental company, luxury Miami rentals, Miami concierge stays"
      />

      <main className="overflow-hidden bg-white">
        <AboutHero />
        <OurStory />
        <RealEstateBanner />
        <WhyChooseUs />
        <About />
      </main>
    </>
  );
};

export default AboutPage;
