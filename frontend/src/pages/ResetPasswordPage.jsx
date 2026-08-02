import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiEye, HiEyeOff, HiCheck } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.password !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwords.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, passwords);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <>
      <SEOHead title="Reset Password" />

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
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                  <HiCheck className="w-8 h-8 text-[var(--color-success)]" />
                </div>
                <h2 className="mb-2 text-xl font-display font-bold text-[var(--color-text-primary)]">Password Reset!</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Your password has been reset. Redirecting to login...
                </p>
              </motion.div>
            ) : (
              <>
                <h1 className="mb-2 text-center text-2xl font-display font-bold text-[var(--color-text-primary)]">
                  Reset Password
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm text-center mb-6">
                  Enter your new password
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">New Password</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.password}
                        onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                        className="input-field pl-10 pr-10"
                        placeholder="Enter new password"
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

                  <div>
                    <label className="input-label">Confirm Password</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="input-field pl-10"
                        placeholder="Confirm new password"
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
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default ResetPasswordPage;
