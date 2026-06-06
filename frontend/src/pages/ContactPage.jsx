import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiClock,
  HiPaperAirplane,
  HiCheck,
} from 'react-icons/hi';
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaPinterest,
} from 'react-icons/fa';
import SEOHead from '../components/common/SEOHead';
import { APP_CONFIG } from '../config/constants';
import apiService from '../config/api';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const contactInfo = [
    {
      icon: HiLocationMarker,
      title: 'Our Office',
      details: [APP_CONFIG.address],
    },
    {
      icon: HiPhone,
      title: 'Phone',
      details: [APP_CONFIG.phone, 'Mon-Sun 8am-10pm'],
    },
    {
      icon: HiMail,
      title: 'Email',
      details: [APP_CONFIG.email, 'support@miamiluxuryrentals.com'],
    },
    {
      icon: HiClock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9am-6pm', 'Sat-Sun: 10am-4pm'],
    },
  ];

  const faqs = [
    {
      question: 'What is the check-in process?',
      answer: 'You will receive detailed check-in instructions 48 hours before your arrival, including access codes and property information.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to a one-night charge.',
    },
    {
      question: 'Do you allow pets?',
      answer: 'Pet policies vary by property. Please check the specific property listing or contact us for details.',
    },
    {
      question: 'Is parking available?',
      answer: 'Most properties include free parking. Check the property amenities for specific details.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Miami Luxury Rentals. We're here to help with your booking, questions, or any assistance you need."
      />

      {/* Header */}
      <section className="bg-[#062B3A] pb-16 pt-32 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="section-title text-white">Contact Us</h1>
            <p className="section-subtitle mx-auto text-white/72">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact info & Form */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[0_14px_34px_rgba(8,51,68,0.08)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{info.title}</h3>
                  </div>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-[var(--color-text-secondary)] text-sm ml-13">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}

              {/* Social links */}
              <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[0_14px_34px_rgba(8,51,68,0.08)]">
                <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: FaInstagram, href: APP_CONFIG.social.instagram },
                    { icon: FaFacebook, href: APP_CONFIG.social.facebook },
                    { icon: FaTwitter, href: APP_CONFIG.social.twitter },
                    { icon: FaPinterest, href: APP_CONFIG.social.pinterest },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-medium)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-12 text-center shadow-[0_18px_48px_rgba(8,51,68,0.10)]"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
                    <HiCheck className="w-10 h-10 text-[var(--color-success)]" />
                  </div>
                  <h2 className="mb-2 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                    Message Sent!
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-[var(--color-border)] bg-white p-8 shadow-[0_18px_48px_rgba(8,51,68,0.10)]">
                  <h2 className="mb-6 text-2xl font-display font-bold text-[var(--color-text-primary)]">
                    Send Us a Message
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="input-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>
                    <div>
                      <label className="input-label">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Question</option>
                        <option value="support">Customer Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="press">Press</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-field resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <HiPaperAirplane className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section>
        <div className="h-[400px] rounded-t-2xl overflow-hidden">
          <MapContainer
            center={[25.7800, -80.1300]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[25.7800, -80.1300]}>
              <Popup>
                <strong>Miami Luxury Rentals</strong>
                <br />
                {APP_CONFIG.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-custom max-w-3xl">
          <h2 className="section-title mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-lg border border-[var(--color-border)] bg-white shadow-[0_12px_30px_rgba(8,51,68,0.06)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-medium text-[var(--color-text-primary)]">
                  {faq.question}
                  <span className="text-[var(--color-primary)] group-open:rotate-45 transition-transform text-xl ml-4">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
