import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCheck,
  HiArrowRight,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaHeadset,
  FaClock,
  FaHeart,
  FaMapMarkerAlt,
  FaTag,
  FaPencilAlt,
} from 'react-icons/fa';
import apiService from '../../config/api';
import { APP_CONFIG } from '../../config/constants';
import toast from 'react-hot-toast';
import ContactBg from '../../assets/contactbg.png';

/* ─── tiny helpers ──────────────────────────────────────────── */
const Input = ({ icon: Icon, className = '', ...props }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e8527a]" />
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-[#e8527a] focus:outline-none focus:ring-4 focus:ring-[#e8527a]/10 ${className}`}
    />
  </div>
);

const ContactInfoItem = ({ icon: Icon, label, value }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="flex items-start gap-4"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8527a] text-white shadow-lg shadow-[#e8527a]/30">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="font-bold text-[#0d3347]">{label}</p>
      <p className="text-sm text-gray-500">{value}</p>
    </div>
  </motion.div>
);

const SocialBtn = ({ icon: Icon, delay }) => (
  <motion.a
    href="#"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ scale: 1.15, backgroundColor: '#e8527a', color: '#fff' }}
    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 transition-colors duration-200"
  >
    <Icon className="h-3.5 w-3.5" />
  </motion.a>
);

const FeatureItem = ({ icon: Icon, title, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="flex items-center gap-3"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8527a]/10">
      <Icon className="h-4 w-4 text-[#e8527a]" />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#0d3347]">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </motion.div>
);

/* ─── main component ────────────────────────────────────────── */
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.submitContact(formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <section className="min-h-screen w-full">
      {/* ── two-column grid ── */}
      <div className="grid min-h-screen lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="flex flex-col justify-center bg-[#fdf6ef] px-8 py-16 sm:px-12 lg:py-24">
          {/* label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex items-center gap-2 border-r-5 border-[#e8527a]"
          >
            <span className="h-2 w-2 rounded-full bg-[#e8527a]" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8527a]">
              Contact Us
            </span>
          </motion.div>

          {/* headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-5xl font-black leading-tight text-[#0d3347] sm:text-6xl">
              Let's Get in
            </h1>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black leading-tight text-[#e8527a] sm:text-6xl">
                Touch
              </h1>
              {/* sun emoji */}
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="text-4xl"
              >
                ☀️
              </motion.span>
            </div>
          </motion.div>

          {/* description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 max-w-xs text-sm leading-relaxed text-gray-500"
          >
            We're here to help you plan your perfect Miami escape. Reach out and
            our team will get back to you shortly.
          </motion.p>

          {/* contact info */}
          <div className="mt-10 space-y-5">
            <ContactInfoItem icon={HiPhone} label="Phone" value={APP_CONFIG.phone} />
            <ContactInfoItem icon={HiMail} label="Email" value={APP_CONFIG.email} />
            <ContactInfoItem
              icon={FaMapMarkerAlt}
              label="Address"
              value={APP_CONFIG.address}
            />
          </div>

          {/* divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="my-8 h-px origin-left bg-gradient-to-r from-[#e8527a]/40 to-transparent"
          />

          {/* social */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
              Follow Us
            </p>
            <div className="flex gap-3">
              <SocialBtn icon={FaFacebookF} delay={0.1} />
              <SocialBtn icon={FaInstagram} delay={0.15} />
              <SocialBtn icon={FaTwitter} delay={0.2} />
              <SocialBtn icon={FaYoutube} delay={0.25} />
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-8 lg:py-16">
          {/* Miami beach background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                `url(${ContactBg})`,
            }}
          />
          {/* subtle dark overlay so cards stay readable */}
          <div className="absolute inset-0 bg-black/15" />

          {/* diagonal left edge — decorative */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[#fdf6ef] [clip-path:polygon(0_0,100%_0,0_100%)] lg:block hidden" />

          <div className="relative z-10 w-full max-w-2xl space-y-5">
            {/* heading above card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="px-1"
            >
              <h2 className="text-2xl font-black text-[#0d3347] sm:text-3xl">
                Send us a Message
              </h2>
              <div className="mt-1.5 h-0.5 w-12 rounded-full bg-[#e8527a]" />
            </motion.div>

            {/* ── FORM CARD ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex min-h-[320px] flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="relative">
                      {[...Array(8)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          animate={{
                            opacity: 0,
                            x: (Math.random() - 0.5) * 140,
                            y: -60 - Math.random() * 50,
                            scale: 0,
                          }}
                          transition={{ duration: 1.4, delay: 0.2 + i * 0.05 }}
                          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: ['#e8527a', '#ffd166', '#06d6a0'][i % 3],
                          }}
                        />
                      ))}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: 'backOut' }}
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8527a] text-white shadow-xl shadow-[#e8527a]/30"
                      >
                        <HiCheck className="h-10 w-10" />
                      </motion.div>
                    </div>
                    <h3 className="mt-6 text-2xl font-black text-[#0d3347]">
                      Message Sent!
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                      Thank you for reaching out. Our team will get back to you
                      within 24 hours.
                    </p>
                    <button
                      onClick={resetForm}
                      className="mt-6 rounded-full border-2 border-[#e8527a] px-6 py-2.5 text-sm font-bold text-[#e8527a] transition-all hover:bg-[#e8527a] hover:text-white"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  /* ── form ── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* row 1 */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        icon={HiUser}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your Name"
                      />
                      <Input
                        icon={HiMail}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Your Email"
                      />
                    </div>

                    {/* row 2 */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        icon={HiPhone}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                      />
                      {/* subject with tag icon */}
                      <div className="relative">
                        <FaTag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e8527a]" />
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Subject"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-[#e8527a] focus:outline-none focus:ring-4 focus:ring-[#e8527a]/10"
                        />
                      </div>
                    </div>

                    {/* message */}
                    <div className="relative">
                      <FaPencilAlt className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-[#e8527a]" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Your Message"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-[#e8527a] focus:outline-none focus:ring-4 focus:ring-[#e8527a]/10"
                      />
                    </div>

                    {/* submit */}
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 rounded-full bg-[#e8527a] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#e8527a]/35 transition-all hover:bg-[#d4405f] hover:shadow-xl disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <HiArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── features bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="rounded-2xl bg-white/90 px-6 py-5 shadow-xl backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <FeatureItem
                  icon={FaHeadset}
                  title="24/7 Support"
                  subtitle="We're here anytime"
                  delay={0.1}
                />
                {/* divider */}
                <div className="hidden h-10 w-px bg-gray-200 sm:block" />
                <FeatureItem
                  icon={FaClock}
                  title="Quick Response"
                  subtitle="We reply within 24h"
                  delay={0.2}
                />
                <div className="hidden h-10 w-px bg-gray-200 sm:block" />
                <FeatureItem
                  icon={FaHeart}
                  title="Personalized Service"
                  subtitle="Tailored just for you"
                  delay={0.3}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;