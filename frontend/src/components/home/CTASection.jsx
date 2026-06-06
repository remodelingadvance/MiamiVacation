import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiPhone, HiMail, HiCalendar } from 'react-icons/hi';

const CTASection = () => {
  return (
    <section className="bg-[#062B3A] py-20">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Ready to Experience
              <br />
              <span className="text-gradient">Miami Luxury?</span>
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Whether you're planning a weekend getaway, a family vacation, or a long-term stay, 
              our team is here to help you find the perfect luxury rental. Browse our collection or 
              get personalized recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/properties"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                <HiCalendar className="w-5 h-5" />
                Browse Properties
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="btn-outline text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Right content - Contact cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-8 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <HiPhone className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-xl mb-2">
                    Call Us
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                    Our concierge team is available 24/7
                  </p>
                  <a
                    href="tel:+13051234567"
                    className="text-2xl font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                  >
                    +1 (305) 123-4567
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-8 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <HiMail className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-xl mb-2">
                    Email Us
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                    We'll respond within 1 hour
                  </p>
                  <a
                    href="mailto:info@miamiluxuryrentals.com"
                    className="text-lg font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                  >
                    info@miamiluxuryrentals.com
                  </a>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                'Best Price Guarantee',
                'Secure Booking',
                '24/7 Support',
              ].map((badge) => (
                <div key={badge} className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-center">
                  <p className="text-white text-sm font-medium">{badge}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
