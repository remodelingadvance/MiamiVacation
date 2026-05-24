import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiPaperAirplane,
} from 'react-icons/hi';
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaPinterest,
  FaYoutube,
} from 'react-icons/fa';
import { APP_CONFIG } from '../../config/constants';
import apiService from '../../config/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubscribing(true);
      await apiService.subscribeNewsletter({ email });
      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const footerLinks = {
    properties: [
      { label: 'Miami Beach Condos', to: '/properties?type=condo' },
      { label: 'Brickell Apartments', to: '/properties?type=apartment' },
      { label: 'Oceanfront Villas', to: '/properties?type=villa' },
      { label: 'Luxury Penthouses', to: '/properties?type=penthouse' },
      { label: 'All Properties', to: '/properties' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
      { label: 'Blog', to: '/blog' },
    ],
    support: [
      { label: 'Help Center', to: '/help' },
      { label: 'Cancellation Policy', to: '/cancellation-policy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'FAQ', to: '/faq' },
    ],
  };

  return (
    <footer className="bg-[var(--color-bg-medium)] border-t border-white/5">
      {/* Main footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--color-bg-dark)]">M</span>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  Miami Luxury
                </h3>
                <p className="text-sm text-[var(--color-primary)] tracking-wider uppercase">
                  Rentals
                </p>
              </div>
            </Link>

            <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Experience the finest luxury vacation rentals in Miami. From oceanfront penthouses 
              to modern Brickell condos, discover your perfect Miami getaway.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              <a
                href={`https://maps.google.com/?q=${APP_CONFIG.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <HiLocationMarker className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{APP_CONFIG.address}</span>
              </a>
              <a
                href={`tel:${APP_CONFIG.phone}`}
                className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <HiPhone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{APP_CONFIG.phone}</span>
              </a>
              <a
                href={`mailto:${APP_CONFIG.email}`}
                className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <HiMail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{APP_CONFIG.email}</span>
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaInstagram, href: APP_CONFIG.social.instagram },
                { icon: FaFacebook, href: APP_CONFIG.social.facebook },
                { icon: FaTwitter, href: APP_CONFIG.social.twitter },
                { icon: FaPinterest, href: APP_CONFIG.social.pinterest },
                { icon: FaYoutube, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-display font-bold text-lg mb-6 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 p-8 rounded-2xl glass-light border border-white/5">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                Stay in the Loop
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Subscribe to our newsletter for exclusive deals, new properties, and Miami travel tips.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 input-field"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <HiPaperAirplane className="w-5 h-5" />
                {subscribing ? 'Sending...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Miami Luxury Rentals. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;