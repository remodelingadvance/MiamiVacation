import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPaperAirplane, HiMail } from 'react-icons/hi';
import apiService from '../../config/api';
import toast from 'react-hot-toast';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await apiService.subscribeNewsletter({ email, source: 'homepage' });
      setSubscribed(true);
      setEmail('');
      toast.success('Welcome aboard! Check your inbox for exclusive deals.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-white p-8 text-center shadow-[0_20px_60px_rgba(8,51,68,0.08)] md:p-16"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            {subscribed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                  <HiPaperAirplane className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <h3 className="mb-4 text-2xl font-display font-bold text-[var(--color-text-primary)] md:text-3xl">
                  You're In!
                </h3>
                <p className="text-[var(--color-text-secondary)] text-lg">
                  Thank you for subscribing! Get ready for exclusive deals and Miami travel inspiration delivered to your inbox.
                </p>
              </motion.div>
            ) : (
              <>
                <h3 className="mb-4 text-3xl font-display font-bold text-[var(--color-text-primary)] md:text-4xl">
                  Get Exclusive Deals
                </h3>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8">
                  Subscribe to our newsletter and be the first to know about special offers, 
                  new properties, and Miami travel tips.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <div className="flex-1 relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-dark)] py-4 pl-12 pr-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all focus:border-[var(--color-primary)] focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary py-4 px-8 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <HiPaperAirplane className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[var(--color-text-muted)] text-sm mt-4">
                  No spam, unsubscribe anytime. View our{' '}
                  <a href="/privacy-policy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
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
