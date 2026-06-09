import SEOHead from '../components/common/SEOHead';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import ContactMap from '../components/contact/ContactMap';
import ContactLocations from '../components/contact/ContactLocations';

const ContactPage = () => {
  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Miami Luxury Rentals. We're here to help with your booking, questions, or any assistance you need."
      />

      <ContactHero />
      <ContactLocations />

      {/* Info + Form */}
      <ContactForm />

      <ContactMap />
    </>
  );
};

export default ContactPage;