import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiPaperAirplane,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaPinterest,
  FaYoutube,
  FaUmbrellaBeach,
  FaHeart,
} from 'react-icons/fa';
import { APP_CONFIG } from '../../config/constants';
import apiService from '../../config/api';
import toast from 'react-hot-toast';
import NewsletterSignup from '../home/NewsletterSignup';
import StayWiseLogo from '../../assets/stay-wise-logo-light.png';

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

  // Footer navigation data
  const quickLinks = [
    { label: 'Home', to: '/', icon: HiOutlineHome },
    { label: 'Stays', to: '/properties', icon: HiOutlineOfficeBuilding },
    { label: 'About Us', to: '/about', icon: HiOutlineInformationCircle },
    { label: 'Contact', to: '/contact', icon: HiOutlineChatBubbleLeftRight  },
  ];

  const companyLinks = [
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Sign In', to: '/login' },
    { label: 'Create Account', to: '/signup' },
  ];

  const socialLinks = [
    { icon: FaInstagram, href: APP_CONFIG.social?.instagram || '#', color: 'hover:bg-gradient-to-tr hover:from-pink-500 hover:to-orange-400' },
    { icon: FaFacebook, href: APP_CONFIG.social?.facebook || '#', color: 'hover:bg-[#1877f2]' },
    { icon: FaTwitter, href: APP_CONFIG.social?.twitter || '#', color: 'hover:bg-[#1da1f2]' },
    { icon: FaPinterest, href: APP_CONFIG.social?.pinterest || '#', color: 'hover:bg-[#e60023]' },
    { icon: FaYoutube, href: '#', color: 'hover:bg-[#ff0000]' },
  ];

  return (
    <>
      <NewsletterSignup />
      <footer className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=1600&q=80")',
          }}
        />
        
        {/* Dark Gradient Overlay - Miami vibe */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#062B3A]/95 via-[#062B3A]/90 to-[#0a3a4a]/95" />
        
        {/* Decorative Miami wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 z-[1] opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#00c9b6" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
          </svg>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 container-custom py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Column 1: Logo & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <Link to="/" className="group inline-flex items-center gap-3">
                {/* Logo Circle */}
                <img src={StayWiseLogo} alt="StayWise Logo" className="h-48 w-40" />
              </Link>

              <p className="text-sm leading-relaxed text-white/75">
                Experience the finest luxury vacation rentals in Miami. From oceanfront penthouses 
                to modern Brickell condos, discover a stay shaped by design, service, and local care.
              </p>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm w-fit">
                <FaHeart className="h-3 w-3 text-[var(--color-primary)]" />
                <span className="text-xs text-white/80">Verified by 500+ happy guests</span>
              </div>
            </motion.div>

            {/* Column 2: Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-5"
            >
              <h4 className="relative inline-block text-lg font-display font-bold text-white">
                Quick Links
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group flex items-center gap-2 text-sm text-white/65 transition-all duration-300 hover:text-white hover:translate-x-1"
                      >
                        <Icon className="h-3.5 w-3.5 transition-all group-hover:text-[var(--color-primary)]" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Column 3: Company / Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-5"
            >
              <h4 className="relative inline-block text-lg font-display font-bold text-white">
                Company
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-2 text-sm text-white/65 transition-all duration-300 hover:text-white hover:translate-x-1"
                    >
                      <span className="h-1 w-1 rounded-full bg-[var(--color-primary)] transition-all group-hover:w-2" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4: Contact & Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-5"
            >
              <h4 className="relative inline-block text-lg font-display font-bold text-white">
                Contact Us
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
              </h4>
              
              <div className="space-y-3">
                <a
                  href={`https://maps.google.com/?q=${APP_CONFIG.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-white/65 transition-all duration-300 hover:text-white"
                >
                  <HiLocationMarker className="mt-0.5 h-4 w-4 flex-shrink-0 transition-colors group-hover:text-[var(--color-primary)]" />
                  <span className="text-sm leading-relaxed">{APP_CONFIG.address}</span>
                </a>
                
                <a
                  href={`tel:${APP_CONFIG.phone}`}
                  className="group flex items-center gap-3 text-white/65 transition-all duration-300 hover:text-white"
                >
                  <HiPhone className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-[var(--color-primary)]" />
                  <span className="text-sm">{APP_CONFIG.phone}</span>
                </a>
                
                <a
                  href={`mailto:${APP_CONFIG.email}`}
                  className="group flex items-center gap-3 text-white/65 transition-all duration-300 hover:text-white"
                >
                  <HiMail className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-[var(--color-primary)]" />
                  <span className="text-sm">{APP_CONFIG.email}</span>
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="pt-3">
                <div className="flex items-center gap-2.5">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -3 }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-transparent hover:text-white ${social.color}`}
                    >
                      <social.icon className="h-4 w-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar with Miami vibe */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 border-t border-white/10 pt-6 sm:mt-16 sm:pt-8"
          >
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-center text-xs text-white/50 sm:text-left">
                &copy; {new Date().getFullYear()} StayWise. All rights reserved. | 
                Crafted with <span className="text-[var(--color-primary)]">♥</span> in Miami
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
                <Link to="/privacy-policy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
                <span className="h-3 w-px bg-white/20" />
                <Link to="/terms" className="transition-colors hover:text-white">
                  Terms of Service
                </Link>
                <span className="h-3 w-px bg-white/20" />
                <Link to="/sitemap" className="transition-colors hover:text-white">
                  Sitemap
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute bottom-20 left-10 z-[1] h-32 w-32 rounded-full bg-[var(--color-primary)] opacity-5 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-40 z-[1] h-40 w-40 rounded-full bg-[var(--color-secondary)] opacity-5 blur-3xl" />
      </footer>
    </>
  );
};

export default Footer;