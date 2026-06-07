import About from "../components/about/About";
import AboutHero from "../components/about/AboutHero";
import ExperiencesSection from "../components/about/ExperiencesSection";
import FeaturesGrid from "../components/about/FeaturesGrid";
import StatsBanner from "../components/about/StatsBanner";
import StorySection from "../components/about/StorySection";


const AboutPage = () => {
  return (
    <main className="bg-white overflow-hidden">
      <AboutHero />
      <About />
      <StorySection />
      <ExperiencesSection />
      <FeaturesGrid />
      <StatsBanner />
    </main>
  );
};

export default AboutPage;