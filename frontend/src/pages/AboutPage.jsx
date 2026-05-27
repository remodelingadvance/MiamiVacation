import AboutHero from "../components/about/AboutHero";
import FeaturesGrid from "../components/about/FeaturesGrid";
import StatsBanner from "../components/about/StatsBanner";
import StorySection from "../components/about/StorySection";


const AboutPage = () => {
  return (
    <main className="bg-white overflow-hidden">
      <AboutHero />
      <StorySection />
      <FeaturesGrid />
      <StatsBanner />
    </main>
  );
};

export default AboutPage;