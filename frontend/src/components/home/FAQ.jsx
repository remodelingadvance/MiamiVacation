import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi';

const faqs = [
  {
    question: 'What is included in the booking price?',
    answer: 'The price includes accommodation, utilities (water, electricity, high-speed WiFi), access to all listed amenities, and basic toiletries. Cleaning fees, service fees, and taxes are calculated separately during checkout. Some properties may include additional services like daily housekeeping or concierge.',
  },
  {
    question: 'How do I check in to my rental property?',
    answer: 'You\'ll receive detailed check-in instructions 48 hours before your arrival. Most properties use smart locks or keypads, allowing for contactless self check-in. Our team is available 24/7 if you need any assistance.',
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Our cancellation policy varies by property. Generally, you can cancel for free up to 48 hours before check-in. Some premium properties may have stricter policies. The exact cancellation policy is displayed on each property page before booking.',
  },
  {
    question: 'Are pets allowed in the properties?',
    answer: 'Pet policies vary by property. Some properties welcome pets with an additional cleaning fee, while others maintain a strict no-pet policy. Check the property\'s house rules or use our "Pet-Friendly" filter when searching.',
  },
  {
    question: 'Is parking available?',
    answer: 'Most of our properties include complimentary parking (typically 1-2 spaces). For properties in high-density areas like South Beach or Brickell, parking availability is clearly stated in the amenities section.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards (Visa, MasterCard, American Express, Discover) through our secure Stripe payment gateway. Some bookings may also be eligible for bank transfer or digital wallet payments.',
  },
  {
    question: 'Can I modify my booking after confirmation?',
    answer: 'Yes, modifications are possible depending on availability and the property\'s policy. Contact our guest support team, and we\'ll assist you with date changes, guest count adjustments, or other modifications. Additional fees may apply.',
  },
  {
    question: 'What safety measures are in place?',
    answer: 'All our properties undergo rigorous safety inspections and are equipped with smoke detectors, fire extinguishers, first aid kits, and emergency contact information. Many properties also feature security systems and secure building access.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[var(--color-bg-medium)] py-20">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 mb-6">
            <HiQuestionMarkCircle className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="section-title">
            Frequently Asked Questions
          </h2>
          <p className="section-subtitle mx-auto">
            Everything you need to know about booking with Miami Luxury Rentals
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[0_12px_30px_rgba(8,51,68,0.06)]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left transition-all"
              >
                <h3 className="pr-4 font-semibold text-[var(--color-text-primary)]">{faq.question}</h3>
                <HiChevronDown
                  className={`w-5 h-5 text-[var(--color-primary)] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
