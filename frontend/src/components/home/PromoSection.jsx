import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiTag, HiCalendar, HiSparkles } from 'react-icons/hi';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const PromoSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main promo card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-8 md:p-12"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm mb-6">
                <HiTag className="w-4 h-4" />
                Limited Time Offer
              </div>
              
              <h3 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-bg-dark)] mb-4">
                Summer Special
                <br />
                <span className="text-5xl md:text-6xl">20% OFF</span>
              </h3>
              
              <p className="text-[var(--color-bg-dark)]/80 mb-6 text-lg">
                Book your summer getaway and save big on luxury Miami properties
              </p>

              <div className="flex items-center gap-4 mb-8" ref={ref}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[var(--color-bg-dark)]">
                    {inView && <CountUp end={30} duration={2} />}
                  </p>
                  <p className="text-sm text-[var(--color-bg-dark)]/70">Days Left</p>
                </div>
                <div className="w-px h-10 bg-[var(--color-bg-dark)]/30" />
                <p className="text-sm text-[var(--color-bg-dark)]/80">
                  Use code: <strong className="text-lg">SUMMER20</strong>
                </p>
              </div>

              <Link
                to="/properties?promo=summer20"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-bg-dark)] text-white font-semibold hover:bg-black transition-all"
              >
                Book Now
                <HiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          </motion.div>

          {/* Side promos */}
          <div className="space-y-6">
            {/* Early bird promo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 hover:border-[var(--color-primary)]/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)]/20 transition-all">
                  <HiCalendar className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold text-lg mb-2">
                    Early Bird Discount
                  </h4>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                    Book 30+ days in advance and save up to 15% on your stay
                  </p>
                  <Link
                    to="/properties"
                    className="text-[var(--color-primary)] text-sm font-medium hover:text-[var(--color-primary-light)] transition-colors inline-flex items-center gap-1"
                  >
                    Learn More
                    <HiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Long stay promo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 hover:border-[var(--color-primary)]/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)]/20 transition-all">
                  <HiSparkles className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold text-lg mb-2">
                    Extended Stay Rewards
                  </h4>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                    Stay 7+ nights and enjoy weekly discounts, complimentary cleaning, and more
                  </p>
                  <Link
                    to="/properties?minNights=7"
                    className="text-[var(--color-primary)] text-sm font-medium hover:text-[var(--color-primary-light)] transition-colors inline-flex items-center gap-1"
                  >
                    View Deals
                    <HiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;