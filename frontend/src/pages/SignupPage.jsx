import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiUser, HiMail, HiLockClosed, HiPhone, HiEye, HiEyeOff } from 'react-icons/hi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const { signup, loginWithFirebase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (providerName) => {
    setSocialLoading(providerName);
    const result = await loginWithFirebase(providerName);
    if (!result.success) {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <SEOHead title="Create Account" />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#052A38] px-4 pb-12 pt-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,79,123,0.26),transparent_34%),linear-gradient(315deg,rgba(24,178,126,0.22),transparent_38%),linear-gradient(180deg,#052A38,#073949_54%,#FFFDFB_54%)]" />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="absolute left-1/2 top-28 h-64 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-[8px] border border-white/15 bg-white/8 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="miami-brand-mark miami-brand-mark-sm">
                <span>M</span>
              </div>
              <span className="text-xl font-display font-bold text-white">Miami Luxury Rentals</span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/75">Save favorites and book Miami stays faster</p>
          </div>

          {/* Form */}
          <div className="glass-strong rounded-[8px] p-5 shadow-2xl sm:p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSocialSignup('google')}
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
                onClick={() => handleSocialSignup('apple')}
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
                <span className="bg-white px-4">or create with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="input-label">First Name</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Invalid characters' },
                      })}
                      className="input-field pl-10"
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Last Name</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                      })}
                      className="input-field pl-10"
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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

              {/* Phone */}
              <div>
                <label className="input-label">Phone (Optional)</label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input-field pl-10"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
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
                      minLength: { value: 8, message: 'Must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                        message: 'Must contain uppercase, lowercase, number, and special character',
                      },
                    })}
                    className="input-field pl-10 pr-10"
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <div>
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms */}
              <p className="text-sm text-[var(--color-text-muted)]">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</Link>
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || Boolean(socialLoading)}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
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
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <Link
              to="/login"
              className="block w-full text-center btn-outline py-3"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default SignupPage;
