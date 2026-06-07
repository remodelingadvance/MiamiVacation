import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, loginWithFirebase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data);
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    setSocialLoading(providerName);
    const result = await loginWithFirebase(providerName);
    if (!result.success) {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <SEOHead title="Sign In" />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#052A38] px-4 pb-12 pt-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,79,123,0.26),transparent_34%),linear-gradient(315deg,rgba(0,169,200,0.30),transparent_38%),linear-gradient(180deg,#052A38,#073949_58%,#FFFDFB_58%)]" />
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="miami-brand-mark miami-brand-mark-sm">
                <span>M</span>
              </div>
              <span className="text-xl font-display font-bold text-white">Miami Luxury Rentals</span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/75">Access your stays, favorites, and booking details</p>
          </div>

          {/* Form */}
          <div className="glass-strong rounded-[8px] p-5 shadow-2xl sm:p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={Boolean(socialLoading) || loading}
                className="flex h-12 items-center justify-center gap-3 rounded-[8px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading === 'google' ? (
                  <div className="h-5 w-5 rounded-full border-2 border-[var(--color-secondary)]/30 border-t-[var(--color-secondary)] animate-spin" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={Boolean(socialLoading) || loading}
                className="flex h-12 items-center justify-center gap-3 rounded-[8px] border border-[#111827] bg-[#111827] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading === 'apple' ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <FaApple className="h-5 w-5" />
                )}
                Apple
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                <span className="bg-white px-4">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email',
                      },
                    })}
                    className="input-field pl-10"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[var(--color-text-secondary)] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || Boolean(socialLoading)}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[var(--color-text-muted)]">
                  New to Miami Luxury Rentals?
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <Link
              to="/signup"
              className="block w-full text-center btn-outline py-3"
            >
              Create an Account
            </Link>
          </div>

          {/* Help */}
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Need help?{' '}
            <Link to="/contact" className="text-[var(--color-primary)] hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default LoginPage;
