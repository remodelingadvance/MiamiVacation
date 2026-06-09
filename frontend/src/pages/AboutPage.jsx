import About from "../components/about/About";
import AboutHero from "../components/about/AboutHero";
import OurStory from "../components/about/OurStory";
import RealEstateBanner from "../components/about/RealEstateBanner";
import WhyChooseUs from "../components/about/WhyChooseUs";


const AboutPage = () => {
  return (
    <main className="bg-white overflow-hidden">
      <AboutHero />
      <OurStory />
      <RealEstateBanner />
      <WhyChooseUs />
      <About />
    </main>
  );
};

export default AboutPage;