import SEOHead from '../components/common/SEOHead';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import ContactMap from '../components/contact/ContactMap';
import ContactFAQ from '../components/contact/ContactFAQ';

const ContactPage = () => {
  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Miami Luxury Rentals. We're here to help with your booking, questions, or any assistance you need."
      />

      <ContactHero />

      {/* Info + Form */}
      <ContactForm />

      <ContactMap />
      <ContactFAQ />
    </>
  );
};

export default ContactPage;