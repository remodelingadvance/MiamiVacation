import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiArrowLeft, HiCheck } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
    }
  };

  return (
    <>
      <SEOHead title="Forgot Password" noIndex />

      <section className="flex min-h-screen items-center justify-center bg-[#062B3A] px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--color-bg-dark)]">M</span>
              </div>
              <span className="text-xl font-display font-bold text-white">Stay Wise</span>
            </Link>
          </div>

          <div className="glass rounded-2xl p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                  <HiCheck className="w-8 h-8 text-[var(--color-success)]" />
                </div>
                <h2 className="mb-2 text-xl font-display font-bold text-[var(--color-text-primary)]">Email Sent!</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                  Check your email for a password reset link. If you don't see it, check your spam folder.
                </p>
                <Link to="/login" className="btn-primary inline-block">
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <>
                <h1 className="mb-2 text-center text-2xl font-display font-bold text-[var(--color-text-primary)]">
                  Forgot Password
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm text-center mb-6">
                  Enter your email and we'll send you a reset link
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Email Address</label>
                    <div className="relative">
                      <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field pl-10"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                  >
                    <HiArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default ForgotPasswordPage;
