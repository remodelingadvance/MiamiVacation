import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, 
        make a booking, subscribe to our newsletter, or contact us for support. This may include your name, 
        email address, phone number, payment information, and travel preferences.`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to process your bookings, communicate with you about 
        your reservations, send you marketing communications (with your consent), improve our services, 
        and comply with legal obligations.`,
    },
    {
      title: 'Information Sharing',
      content: `We do not sell your personal information. We may share your information with property 
        owners/managers to fulfill your booking, payment processors to handle transactions, and service 
        providers who assist us in operating our platform.`,
    },
    {
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal 
        information against unauthorized access, alteration, disclosure, or destruction.`,
    },
    {
      title: 'Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to enhance your browsing experience, 
        analyze site traffic, and personalize content. You can control cookie preferences through your 
        browser settings.`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to access, correct, or delete your personal information. You can also 
        opt-out of marketing communications at any time. To exercise these rights, please contact us.`,
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy, please contact us at 
        privacy@miamiluxuryrentals.com or through our contact page.`,
    },
  ];

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Miami Luxury Rentals Privacy Policy - Learn how we collect, use, and protect your personal information."
      />

      <section className="pt-32 pb-16">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="section-title text-white mb-4">Privacy Policy</h1>
            <p className="text-[var(--color-text-secondary)] mb-2">
              Last updated: January 1, 2024
            </p>
            <p className="text-[var(--color-text-secondary)] mb-12">
              At Miami Luxury Rentals, we take your privacy seriously. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our platform.
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

export default PrivacyPolicyPage;