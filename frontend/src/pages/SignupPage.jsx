import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiEye, HiEyeOff, HiCheck, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import FillButton from '../components/common/FillButton';

const testimonials = [
  {
    quote:
      'Booked a Miami penthouse on a whim for a long weekend â€” the whole process took five minutes and the place was even better than the photos.',
    name: 'Anneliese Woodman',
    role: 'Art Director Â· Sydney, Australia',
  },
  {
    quote:
      'I travel for work constantly. Having one trusted place for every Miami stay has saved me hours and a lot of stress.',
    name: 'Marcus Lee',
    role: 'Founder Â· San Francisco, USA',
  },
  {
    quote:
      'The concierge handled everything from early check-in to dinner reservations. It honestly felt like a five-star hotel.',
    name: 'Priya Nair',
    role: 'Designer Â· London, UK',
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,20}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SignupPage = () => {
  const { signup, loginWithFirebase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [currentT, setCurrentT] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password') || '';

  // Live password requirement checks (mirror the validation regex)
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /\d/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const id = setInterval(() => setCurrentT((t) => (t + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });
    if (!result.success) setLoading(false);
  };

  const handleSocialSignup = async (providerName) => {
    setSocialLoading(providerName);
    const result = await loginWithFirebase(providerName);
    if (!result.success) setSocialLoading(null);
  };

  const nextT = () => setCurrentT((t) => (t + 1) % testimonials.length);
  const prevT = () => setCurrentT((t) => (t - 1 + testimonials.length) % testimonials.length);

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[var(--color-secondary)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/12';
  const labelClass =
    'mb-1.5 block text-sm font-semibold text-[var(--color-secondary)]';

  return (
    <>
      <SEOHead title="Create Account" noIndex />

      <section className="flex min-h-screen flex-col-reverse lg:h-screen lg:flex-row mt-20">
        {/* â”€â”€â”€â”€â”€â”€â”€ LEFT: form â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative flex w-full flex-col bg-white lg:h-screen lg:w-[45%] lg:overflow-y-auto">
          {/* Logo */}
          <div className="px-6 pt-7 sm:px-10">
            <Link
            to="/login"
            className="absolute right-5 top-5 rounded-full bg-[var(--color-secondary)] px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg sm:right-8 sm:top-8"
          >
            Sign In
          </Link>
          </div>

          {/* Form body */}
          <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black leading-tight text-[var(--color-secondary)] sm:text-4xl"
            >
              Create {' '}
              <span className="text-[var(--color-primary)]">Your Account</span>
            </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-1 text-center text-sm text-gray-400"
              >
                Save favorites and book Miami stays faster.
              </motion.p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      type="text"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Invalid characters' },
                      })}
                      className={inputClass}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      type="text"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Invalid characters' },
                      })}
                      className={inputClass}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email Address</label>
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
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone (Optional)</label>
                  <input
                    type="tel"
                    {...register('phone', {
                      pattern: {
                        value: phonePattern,
                        message: 'Please enter a valid phone number',
                      },
                    })}
                    className={inputClass}
                    placeholder="(305) 615-3735"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Must be at least 8 characters' },
                        pattern: {
                          value: passwordPattern,
                          message: 'Must contain uppercase, lowercase, number, and special character',
                        },
                      })}
                      className={`${inputClass} pr-11`}
                      placeholder="Create a strong password"
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

                  {/* Live requirement checklist */}
                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5 overflow-hidden"
                      >
                        {checks.map((c) => (
                          <div key={c.label} className="flex items-center gap-2 text-[13px]">
                            <motion.span
                              animate={{ scale: c.valid ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                c.valid ? 'bg-emerald-500' : 'border-2 border-gray-300'
                              }`}
                            >
                              {c.valid && <HiCheck className="h-2.5 w-2.5 text-white" />}
                            </motion.span>
                            <span className={c.valid ? 'text-gray-700' : 'text-gray-400'}>
                              {c.label}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className={`${inputClass} pr-11`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[var(--color-primary)]"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <FillButton variant="primary"
                  type="submit"
                  disabled={loading || Boolean(socialLoading)}
                  whileHover={{ y: loading ? 0 : -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-bold text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </FillButton>
              </form>

              {/* or divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-medium text-gray-400">or</span>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <FillButton variant="secondary"
                  type="button"
                  onClick={() => handleSocialSignup('google')}
                  disabled={Boolean(socialLoading) || loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[var(--color-secondary)] transition-all hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {socialLoading === 'google' ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-secondary)]" />
                  ) : (
                    <FcGoogle className="h-5 w-5" />
                  )}
                  Google
                </FillButton>
                <FillButton variant="secondary"
                  type="button"
                  onClick={() => handleSocialSignup('apple')}
                  disabled={Boolean(socialLoading) || loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[var(--color-secondary)] transition-all hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {socialLoading === 'apple' ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-secondary)]" />
                  ) : (
                    <FaApple className="h-5 w-5" />
                  )}
                  Apple
                </FillButton>
              </div>

              {/* Sign in link */}
              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Terms at bottom */}
          <p className="px-6 pb-6 text-center text-xs text-gray-400 sm:px-10">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-[var(--color-primary)]">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="underline hover:text-[var(--color-primary)]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€ RIGHT: image panel â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-screen lg:w-[55%]">
          <img
            src="https://images.pexels.com/photos/3927911/pexels-photo-3927911.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80"
            alt="Miami beachfront vacation home"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25" />

          {/* Back button */}
          <motion.button
            type="button"
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-secondary)] shadow-lg lg:left-6 lg:top-6"
            aria-label="Go back"
          >
            <HiArrowLeft className="h-5 w-5" />
          </motion.button>

          {/* Testimonial card (desktop) */}
          <div className="absolute inset-x-5 bottom-5 hidden lg:block lg:inset-x-auto lg:bottom-6 lg:left-6 lg:right-24">
            <div className="rounded-2xl bg-white/15 p-5 ring-1 ring-white/25 backdrop-blur-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentT}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-sm leading-relaxed text-white">
                    "{testimonials[currentT].quote}"
                  </p>
                  <p className="mt-3 font-bold text-white">{testimonials[currentT].name}</p>
                  <p className="text-xs text-white/75">{testimonials[currentT].role}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Carousel arrows (desktop) */}
          <div className="absolute bottom-6 right-6 hidden flex-col gap-2 lg:flex">
            <motion.button
              type="button"
              onClick={nextT}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-secondary)] shadow-lg transition-colors hover:bg-white"
              aria-label="Next testimonial"
            >
              <HiArrowRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={prevT}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-secondary)] shadow-lg transition-colors hover:bg-white"
              aria-label="Previous testimonial"
            >
              <HiArrowLeft className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupPage;
