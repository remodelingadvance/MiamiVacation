import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiShieldCheck } from 'react-icons/hi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import SEOHead from '../components/common/SEOHead';

const AdminLogin = () => {
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    if (!result.success) {
      setError(result.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <>
      <SEOHead title="Admin Login" />

      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-4">
              <span className="text-3xl font-bold text-[var(--color-bg-dark)]">S</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Portal</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Stay Wise</p>
          </div>

          {/* Login form */}
          <div className="glass-strong rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <HiShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold text-white">Secure Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="input-field pl-10"
                    placeholder="info@staywise.miami"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Admin'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
              Authorized personnel only. All access is monitored and logged.
            </p>
          </div>

          <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
            <a href="/" className="text-[var(--color-primary)] hover:underline">Back to Website</a>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;