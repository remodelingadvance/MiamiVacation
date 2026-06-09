import About from "../components/about/About";
import AboutHero from "../components/about/AboutHero";
import DreamHomeBanner from "../components/about/DreamHomeBanner";
import ExperiencesSection from "../components/about/ExperiencesSection";
import FeaturesGrid from "../components/about/FeaturesGrid";
import OurStory from "../components/about/OurStory";
import RealEstateBanner from "../components/about/RealEstateBanner";
import StatsBanner from "../components/about/StatsBanner";
import StorySection from "../components/about/StorySection";
import WhyChooseUs from "../components/about/WhyChooseUs";


const AboutPage = () => {
  return (
    <main className="bg-white overflow-hidden">
      <AboutHero />
      <OurStory />
      <RealEstateBanner />
      <WhyChooseUs />
      <About />
      <DreamHomeBanner />
      <StorySection />
      <ExperiencesSection />
      <FeaturesGrid />
      <StatsBanner />
    </main>
  );
};

export default AboutPage;