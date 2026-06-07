import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiQuestionMarkCircle } from 'react-icons/hi';

const faqs = [
  {
    question: 'What is the check-in process?',
    answer:
      'You will receive detailed check-in instructions 48 hours before your arrival, including access codes and property information.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to a one-night charge.',
  },
  {
    question: 'Do you allow pets?',
    answer:
      'Pet policies vary by property. Please check the specific property listing or contact us for details.',
  },
  {
    question: 'Is parking available?',
    answer:
      'Most properties include free parking. Check the property amenities for specific details.',
  },
];

const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] sm:text-xs">
            <HiQuestionMarkCircle className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] sm:text-3xl lg:text-4xl">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`overflow-hidden rounded-2xl border bg-white shadow-[0_12px_30px_rgba(8,51,68,0.06)] transition-colors ${
                  isOpen ? 'border-[var(--color-primary)]/40' : 'border-[var(--color-border)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-[var(--color-text-primary)] sm:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-medium)] text-[var(--color-primary)]'
                    }`}
                  >
                    <HiPlus className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:px-6 sm:pb-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;