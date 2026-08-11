import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  HiSave,
  HiGlobe,
  HiMail,
  HiLockClosed,
  HiCreditCard,
  HiBell,
  HiShieldCheck,
  HiCloud,
  HiKey,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();
  const { register: registerEmail, handleSubmit: handleEmailSubmit } = useForm();

  const handlePasswordUpdate = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await adminApi.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSettings = async (data) => {
    try {
      setSaving(true);
      toast.success('Email settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'general', label: 'General', icon: HiGlobe },
    { key: 'email', label: 'Email', icon: HiMail },
    { key: 'payment', label: 'Payment', icon: HiCreditCard },
    { key: 'notifications', label: 'Notifications', icon: HiBell },
    { key: 'security', label: 'Security', icon: HiShieldCheck },
    { key: 'integrations', label: 'Integrations', icon: HiCloud },
  ];

  return (
    <>
      <SEOHead title="Settings" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Manage your admin panel settings</p>
        </div>

        <div className="flex gap-6">
          {/* Tabs sidebar */}
          <div className="w-56 flex-shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">General Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Site Name</label>
                      <input type="text" defaultValue="Stay Wise" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Site URL</label>
                      <input type="text" defaultValue="https://staywise.miami" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Admin Email</label>
                      <input type="email" defaultValue="info@staywise.miami" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input type="text" defaultValue="(305) 615-3735" className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Address</label>
                      <input type="text" defaultValue="1717 N Bayshore Dr. Ste R217, Miami, FL" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Currency</label>
                      <select className="input-field">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Default Tax Rate (%)</label>
                      <input type="number" step="0.1" defaultValue="13.5" className="input-field" />
                    </div>
                  </div>

                  <button className="btn-primary flex items-center gap-2">
                    <HiSave className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Email Configuration</h3>
                  
                  <form onSubmit={handleEmailSubmit(handleEmailSettings)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">SMTP Host</label>
                        <input type="text" defaultValue="smtp-relay.brevo.com" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">SMTP Port</label>
                        <input type="number" defaultValue="587" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Sender Email</label>
                        <input type="email" defaultValue="info@staywise.miami" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Sender Name</label>
                        <input type="text" defaultValue="Stay Wise" className="input-field" />
                      </div>
                      <div className="col-span-2">
                        <label className="input-label">API Key</label>
                        <div className="relative">
                          <HiKey className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                          <input type="password" defaultValue="••••••••••••••••" className="input-field pl-10" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary flex items-center gap-2">
                      <HiSave className="w-4 h-4" />
                      Save Email Settings
                    </button>
                  </form>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Payment Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Stripe Secret Key</label>
                      <input type="password" defaultValue="sk_test_••••••••••••" className="input-field font-mono" />
                    </div>
                    <div>
                      <label className="input-label">Stripe Publishable Key</label>
                      <input type="text" defaultValue="pk_test_••••••••••••" className="input-field font-mono" />
                    </div>
                    <div>
                      <label className="input-label">Webhook Secret</label>
                      <input type="password" defaultValue="whsec_••••••••••••" className="input-field font-mono" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)]" />
                      <label className="text-sm text-[var(--color-text-secondary)]">Enable test mode</label>
                    </div>
                  </div>

                  <button className="btn-primary flex items-center gap-2">
                    <HiSave className="w-4 h-4" />
                    Save Payment Settings
                  </button>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'New booking alerts', checked: true },
                      { label: 'Booking cancellation alerts', checked: true },
                      { label: 'New review notifications', checked: true },
                      { label: 'Contact form submissions', checked: true },
                      { label: 'Payment failure alerts', checked: true },
                      { label: 'Weekly summary reports', checked: false },
                      { label: 'Marketing updates', checked: false },
                    ].map((item) => (
                      <label key={item.label} className="flex items-center justify-between p-3 rounded-lg glass-light cursor-pointer">
                        <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                      </label>
                    ))}
                  </div>

                  <button className="btn-primary flex items-center gap-2">
                    <HiSave className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Security Settings</h3>
                  
                  <form onSubmit={handlePasswordSubmit(handlePasswordUpdate)} className="space-y-4">
                    <div>
                      <label className="input-label">Current Password</label>
                      <div className="relative">
                        <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                        <input
                          type="password"
                          {...registerPassword('currentPassword', { required: true })}
                          className="input-field pl-10"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        {...registerPassword('newPassword', { required: true, minLength: 8 })}
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="input-label">Confirm New Password</label>
                      <input
                        type="password"
                        {...registerPassword('confirmPassword', { required: true })}
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      {saving ? 'Updating...' : (
                        <>
                          <HiSave className="w-4 h-4" />
                          Update Password
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-white font-semibold mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="btn-outline text-sm">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-sm font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div className="glass rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white">Integrations</h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Cloudinary', status: 'connected', description: 'Image and video hosting' },
                      { name: 'Stripe', status: 'connected', description: 'Payment processing' },
                      { name: 'Brevo (Sendinblue)', status: 'connected', description: 'Email service' },
                      { name: 'Google Analytics', status: 'not_connected', description: 'Website analytics' },
                      { name: 'OpenStreetMap', status: 'connected', description: 'Maps and location' },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg glass-light">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-white font-medium">{integration.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{integration.description}</p>
                          </div>
                        </div>
                        <button className={`text-sm font-medium ${
                          integration.status === 'connected'
                            ? 'text-red-400 hover:text-red-500'
                            : 'text-[var(--color-primary)] hover:text-[var(--color-primary-light)]'
                        }`}>
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
