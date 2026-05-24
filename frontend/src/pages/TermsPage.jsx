import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';

const TermsPage = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing and using Miami Luxury Rentals, you agree to be bound by these Terms of Service. 
        If you do not agree with any part of these terms, you may not use our services.`,
    },
    {
      title: 'Booking and Payments',
      content: `All bookings are subject to availability and confirmation. Prices are subject to change 
        until confirmed. Payment must be made in full at the time of booking unless otherwise specified. 
        We accept major credit cards and other payment methods as displayed during checkout.`,
    },
    {
      title: 'Cancellation Policy',
      content: `Cancellation policies vary by property. Generally, free cancellation is available up to 
        48 hours before check-in. Late cancellations or no-shows may result in charges. Please review 
        the specific property's cancellation policy before booking.`,
    },
    {
      title: 'Guest Responsibilities',
      content: `Guests are expected to treat the property with respect, follow house rules, and leave 
        the property in reasonable condition. Any damages caused by guests will be charged accordingly.`,
    },
    {
      title: 'Property Listings',
      content: `While we strive to ensure accuracy, property listings may contain errors or omissions. 
        We reserve the right to correct any errors and modify listings at any time without prior notice.`,
    },
    {
      title: 'Limitation of Liability',
      content: `Miami Luxury Rentals acts as an intermediary between guests and property owners. We are 
        not liable for any damages, injuries, or losses arising from the use of our platform or the 
        properties booked through it.`,
    },
    {
      title: 'Intellectual Property',
      content: `All content on this website, including text, images, logos, and software, is the property 
        of Miami Luxury Rentals and is protected by copyright and other intellectual property laws.`,
    },
    {
      title: 'Modifications',
      content: `We reserve the right to modify these terms at any time. Changes will be effective 
        immediately upon posting. Continued use of our services constitutes acceptance of the modified terms.`,
    },
  ];

  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Miami Luxury Rentals Terms of Service - Read our terms and conditions for booking and using our platform."
      />

      <section className="pt-32 pb-16">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="section-title text-white mb-4">Terms of Service</h1>
            <p className="text-[var(--color-text-secondary)] mb-2">
              Last updated: January 1, 2024
            </p>
            <p className="text-[var(--color-text-secondary)] mb-12">
              Please read these Terms of Service carefully before using the Miami Luxury Rentals platform.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h2 className="text-xl font-display font-bold text-white mb-3">
                    {section.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default TermsPage;