import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheckCircle, HiMail, HiRefresh, HiShieldCheck } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const { verifyEmail, verifyEmailCode, resendVerificationCode } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(Boolean(token));
  const [resending, setResending] = useState(false);
  const [legacyStatus, setLegacyStatus] = useState(null);
  const legacyVerificationStarted = useRef(false);

  useEffect(() => {
    if (!token || legacyVerificationStarted.current) return;

    legacyVerificationStarted.current = true;
    const verifyToken = async () => {
      const result = await verifyEmail(token);
      setLegacyStatus(result.success ? 'success' : 'error');
      setLoading(false);
    };

    verifyToken();
  }, [token, verifyEmail]);

  const handleCodeChange = (event) => {
    const nextCode = event.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(nextCode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await verifyEmailCode({ email, code });
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    await resendVerificationCode(email);
    setResending(false);
  };

  return (
    <>
      <SEOHead title="Verify Email" noIndex />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#052A38] px-4 pb-12 pt-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,79,123,0.25),transparent_34%),linear-gradient(315deg,rgba(0,169,200,0.26),transparent_38%),linear-gradient(180deg,#052A38,#073949_56%,#FFFDFB_56%)]" />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="absolute left-1/2 top-28 h-56 w-[32rem] max-w-[88vw] -translate-x-1/2 rounded-[8px] border border-white/15 bg-white/8 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="miami-brand-mark miami-brand-mark-sm">
                <span>M</span>
              </div>
              <span className="text-xl font-display font-bold text-white">Stay Wise Miami</span>
            </Link>
            <h1 className="mb-2 text-3xl font-display font-bold text-white">Verify Your Email</h1>
            <p className="text-white/75">Secure your account before booking your Miami stay</p>
          </div>

          <div className="glass-strong rounded-[8px] p-5 shadow-2xl sm:p-8">
            {token ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[8px] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  {legacyStatus === 'success' ? (
                    <HiCheckCircle className="h-9 w-9" />
                  ) : (
                    <HiShieldCheck className="h-9 w-9" />
                  )}
                </div>
                <h2 className="mb-3 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                  {loading && 'Checking Verification'}
                  {!loading && legacyStatus === 'success' && 'Email Verified'}
                  {!loading && legacyStatus === 'error' && 'Verification Link Expired'}
                </h2>
                <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                  {loading && 'Please wait while we confirm your email address.'}
                  {!loading && legacyStatus === 'success' && 'Your email is verified. You can now sign in and continue booking.'}
                  {!loading && legacyStatus === 'error' && 'Please request a fresh code from the signup or login screen.'}
                </p>
                <Link to="/login" className="btn-primary w-full py-3">
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start gap-4 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-medium)] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-[var(--color-primary)] shadow-sm">
                    <HiShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-[var(--color-text-primary)]">
                      Enter the 6-digit code
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      We sent a verification code to your email. It expires in 15 minutes.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="input-label">Email Address</label>
                    <div className="relative">
                      <HiMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="input-field pl-10"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={handleCodeChange}
                      className="input-field h-14 text-center text-2xl font-black tracking-[0.38em]"
                      placeholder="000000"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6 || !email}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                </form>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resending ? (
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--color-secondary)]/30 border-t-[var(--color-secondary)] animate-spin" />
                    ) : (
                      <HiRefresh className="h-4 w-4" />
                    )}
                    Resend Code
                  </button>
                  <Link
                    to="/login"
                    className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-medium)] px-4 text-sm font-bold text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--color-primary)]"
                  >
                    <HiArrowLeft className="h-4 w-4" />
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

export default VerifyEmailPage;
