import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPaperAirplane, HiMail, HiSparkles } from 'react-icons/hi';
import apiService from '../../config/api';
import toast from 'react-hot-toast';
import NewsImg from '../../assets/ctabg.png';

const NEWSLETTER_BG = NewsImg;
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await apiService.subscribeNewsletter({
        email: email.trim(),
        source: 'homepage',
      });

      setSubscribed(true);
      setEmail('');
      toast.success('Welcome aboard! Check your inbox for exclusive deals.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Subscription failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] bg-[var(--color-text-dark)] px-5 py-12 text-center shadow-[0_30px_90px_rgba(17,24,39,0.22)] sm:px-8 sm:py-16 lg:px-14 lg:py-20"
        >
          <img
            src={NEWSLETTER_BG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xl backdrop-blur"
            >
              {subscribed ? (
                <HiPaperAirplane className="h-8 w-8" />
              ) : (
                <HiSparkles className="h-8 w-8" />
              )}
            </motion.div>

            {subscribed ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h3 className="mb-4 font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                  You're In!
                </h3>

                <p className="mx-auto max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                  Thank you for subscribing! Get ready for exclusive deals and
                  Miami travel inspiration delivered to your inbox.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-white/75">
                  Stay Updated
                </p>

                <h3 className="mb-4 font-display text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                  Get Exclusive Deals
                </h3>

                <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                  Subscribe to our newsletter and be the first to know about
                  special offers, new properties, and Miami travel tips.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mx-auto flex max-w-2xl flex-col gap-3 rounded-[24px] bg-white/12 p-2 backdrop-blur-md sm:flex-row"
                >
                  <div className="relative flex-1">
                    <HiMail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-14 w-full rounded-[18px] border border-white/20 bg-white pl-12 pr-4 text-[var(--color-text-dark)] placeholder:text-[var(--color-text-muted)] shadow-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-white/20"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] px-8 text-sm font-black text-white shadow-lg shadow-pink-500/30 transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Subscribe
                        <HiPaperAirplane className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-sm text-white/70">
                  No spam, unsubscribe anytime. View our{' '}
                  <a
                    href="/privacy-policy"
                    className="font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                  >
                    Privacy Policy
                  </a>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;