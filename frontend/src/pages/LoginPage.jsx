import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiEye, HiEyeOff, HiHome, HiCheck } from 'react-icons/hi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import FillButton from '../components/common/FillButton';

const slides = [
  'https://images.pexels.com/photos/30021728/pexels-photo-30021728.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80',
  'https://images.pexels.com/photos/33664887/pexels-photo-33664887.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80',
  'https://images.pexels.com/photos/33837662/pexels-photo-33837662.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80',
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LoginPage = () => {
  const { login, loginWithFirebase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [slide, setSlide] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // auto-advance left carousel
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data);
    if (!result.success) setLoading(false);
  };

  const handleSocialLogin = async (providerName) => {
    setSocialLoading(providerName);
    const result = await loginWithFirebase(providerName);
    if (!result.success) setSocialLoading(null);
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[var(--color-secondary)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/12';

  return (
    <>
      <SEOHead title="Sign In" noIndex />

      <section className="flex min-h-screen flex-col lg:flex-row mt-20 border-b border-[var(--color-primary)]">
        {/* â”€â”€â”€â”€â”€â”€â”€ LEFT: image carousel â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-auto lg:w-1/2">
          <AnimatePresence>
            <motion.img
              key={slide}
              src={slides[slide]}
              alt="Luxury Miami home"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />

          {/* Bottom text + dots */}
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-9 sm:left-9">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white drop-shadow sm:text-4xl"
            >
              Find your sweet home
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 max-w-xs text-sm text-white/85"
            >
              Schedule a visit and book your dream stay in just a few clicks.
            </motion.p>
            <div className="mt-4 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="h-1.5 rounded-full bg-white transition-all duration-300"
                  style={{ width: i === slide ? '28px' : '10px', opacity: i === slide ? 1 : 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€ RIGHT: form â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative flex w-full items-center justify-center bg-white px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
          {/* Top-right pill */}
          <Link
            to="/signup"
            className="absolute right-5 top-5 rounded-full bg-[var(--color-secondary)] px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg sm:right-8 sm:top-8"
          >
            Sign Up
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black leading-tight text-[var(--color-secondary)] sm:text-4xl"
            >
              Welcome Back to{' '}
              <span className="text-[var(--color-primary)]">StayWise!</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-gray-400"
            >
              Sign in to your account
            </motion.p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="mb-1.5 block text-sm font-semibold text-[var(--color-secondary)]">
                  Your Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: emailPattern,
                      message: 'Please enter a valid email',
                    },
                  })}
                  className={inputClass}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="mb-1.5 block text-sm font-semibold text-[var(--color-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className={`${inputClass} pr-11`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[var(--color-primary)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Remember + Forgot */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex cursor-pointer items-center gap-2 text-[var(--color-secondary)]">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                    <HiCheck className="h-3 w-3 text-white transition-opacity" />
                  </span>
                  Remember Me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-gray-400 transition-colors hover:text-[var(--color-primary)]"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Login button */}
              <FillButton variant="primary"
                type="submit"
                disabled={loading || Boolean(socialLoading)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: loading ? 0 : -2 }}
                whileTap={{ scale: 0.99 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-bold text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </FillButton>
            </form>

            {/* Instant Login divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-medium text-gray-400">
                  Instant Login
                </span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FillButton variant="secondary"
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={Boolean(socialLoading) || loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-[var(--color-secondary)] transition-all hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading === 'google' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-secondary)]" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                Continue with Google
              </FillButton>
              <FillButton variant="secondary"
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={Boolean(socialLoading) || loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-[var(--color-secondary)] transition-all hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading === 'apple' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-secondary)]" />
                ) : (
                  <FaApple className="h-5 w-5" />
                )}
                Continue with Apple
              </FillButton>
            </div>

            {/* Register link */}
            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have any account?{' '}
              <Link to="/signup" className="font-bold text-[var(--color-primary)] hover:underline">
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
