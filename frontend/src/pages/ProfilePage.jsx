import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiHeart,
  HiStar,
  HiCog,
  HiLogout,
  HiCamera,
  HiPencil,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-medium)] pt-24">
        <div className="container-custom py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)]">Please Sign In</h1>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: HiUser },
    { key: 'bookings', label: 'My Bookings', icon: HiCalendar },
    { key: 'favorites', label: 'Wishlist', icon: HiHeart },
    { key: 'reviews', label: 'My Reviews', icon: HiStar },
    { key: 'settings', label: 'Settings', icon: HiCog },
  ];

  return (
    <>
      <SEOHead title="My Profile" />

      <section className="bg-[var(--color-bg-medium)] pb-16 pt-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="mb-6 rounded-lg bg-white p-6 text-center shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--color-primary)]">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-bg-dark)] hover:bg-[var(--color-primary-light)] transition-colors">
                    <HiCamera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-display font-bold text-[var(--color-text-primary)]">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-[var(--color-text-muted)] text-sm">{user.email}</p>
                <span className="badge badge-primary mt-2 capitalize">{user.role}</span>
              </div>

              {/* Navigation */}
              <nav className="overflow-hidden rounded-lg bg-white shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all ${
                      activeTab === tab.key
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-medium)] hover:text-[var(--color-primary)]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-left text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <HiLogout className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'profile' && (
                  <div className="rounded-lg bg-white p-8 shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">
                        Profile Information
                      </h2>
                      <button
                        onClick={() => setEditing(!editing)}
                        className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                      >
                        <HiPencil className="w-4 h-4" />
                        {editing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {editing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="input-label">First Name</label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="input-label">Last Name</label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="input-field"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="input-label">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-medium)] p-4">
                          <HiUser className="w-5 h-5 text-[var(--color-primary)]" />
                          <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Full Name</p>
                            <p className="text-[var(--color-text-primary)]">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-medium)] p-4">
                          <HiMail className="w-5 h-5 text-[var(--color-primary)]" />
                          <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Email</p>
                            <p className="text-[var(--color-text-primary)]">{user.email}</p>
                            {!user.isVerified && (
                              <span className="text-xs text-[var(--color-warning)]">Not verified</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-medium)] p-4">
                          <HiPhone className="w-5 h-5 text-[var(--color-primary)]" />
                          <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Phone</p>
                            <p className="text-[var(--color-text-primary)]">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-medium)] p-4">
                          <HiCalendar className="w-5 h-5 text-[var(--color-primary)]" />
                          <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Member Since</p>
                            <p className="text-[var(--color-text-primary)]">{formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="rounded-lg bg-white p-8 shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                    <h2 className="mb-6 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                      My Bookings
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                      Your booking history will appear here.
                    </p>
                    <Link to="/my-bookings" className="btn-primary mt-4 inline-block">
                      View All Bookings
                    </Link>
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="rounded-lg bg-white p-8 shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                    <h2 className="mb-6 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                      Wishlist
                    </h2>
                    <Link to="/wishlist" className="btn-primary inline-block">
                      View Wishlist
                    </Link>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="rounded-lg bg-white p-8 shadow-[0_14px_34px_rgba(8,51,68,0.08)] ring-1 ring-black/5">
                    <h2 className="mb-6 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                      Account Settings
                    </h2>
                    <div className="space-y-4">
                      <Link
                        to="/update-password"
                        className="block rounded-lg bg-[var(--color-bg-medium)] p-4 text-[var(--color-text-primary)] transition-all hover:text-[var(--color-primary)]"
                      >
                        Change Password
                      </Link>
                      <button className="block w-full text-left p-4 rounded-lg glass-light text-red-500 hover:bg-red-500/5 transition-all">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
