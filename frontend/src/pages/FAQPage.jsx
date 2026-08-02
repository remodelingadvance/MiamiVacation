import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TbShieldCheck,
  TbHeadset,
  TbCalendarEvent,
  TbHomeHeart,
  TbClock,
  TbPaw,
  TbCar,
  TbFileText,
  TbPlus,
  TbMinus,
  TbArrowRight,
  TbBuildingSkyscraper,
  TbCreditCard,
  TbWifi,
  TbPool,
  TbUserHeart,
  TbMapPin,
  TbMail,
  TbPhone,
  TbLock,
  TbUserCircle,
  TbSettings,
} from "react-icons/tb";
import { HiArrowRight } from "react-icons/hi";
import { CiDiscount1 } from "react-icons/ci";
import SEOHead from "../components/common/SEOHead";
import { APP_CONFIG } from "../config/constants";
import HeroImg from "../assets/faq-bg.png";
import backgroundImage from "../assets/our-story-bg.png";

const EASE = [0.21, 0.47, 0.32, 0.98];
const HERO_IMAGE = HeroImg;

/* ── Trust badges matching policy/terms style ── */
const trustBadges = [
  { icon: TbShieldCheck, title: "Trusted & Secure", desc: "Your safety is our priority" },
  { icon: CiDiscount1, title: "Best Price Guarantee", desc: "Always the best rates" },
  { icon: TbHeadset, title: "24/7 Support", desc: "We're here for you" },
  { icon: TbCalendarEvent, title: "Flexible Booking", desc: "Plans change, we get it" },
];

/* ── FAQ categories ── */
const faqCategories = [
  { id: "booking", label: "Booking", icon: TbHomeHeart },
  { id: "stay", label: "Your Stay", icon: TbBuildingSkyscraper },
  { id: "payment", label: "Payment", icon: TbCreditCard },
  { id: "amenities", label: "Amenities", icon: TbWifi },
];

/* ── FAQ data ── */
const faqs = [
  {
    id: 1,
    category: "booking",
    icon: TbHomeHeart,
    question: "How do I book a StayWise property?",
    answer:
      "Booking is easy! Simply choose your destination, select your dates, and pick the perfect home. You can book securely online or contact our concierge team for personalized assistance.",
  },
  {
    id: 2,
    category: "booking",
    icon: TbClock,
    question: "What time is check-in and check-out?",
    answer:
      "Standard check-in is at 4:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request — just ask our concierge team!",
  },
  {
    id: 3,
    category: "stay",
    icon: TbPaw,
    question: "Are pets allowed in the properties?",
    answer:
      "Some of our properties are pet-friendly! Look for the pet-friendly badge on listings, or contact us to find the perfect home for you and your furry friend. Additional pet fees may apply.",
  },
  {
    id: 4,
    category: "stay",
    icon: TbCar,
    question: "Is there parking available?",
    answer:
      "Many of our properties include complimentary parking. Check the amenities section of each listing for parking details, or ask our team for properties with guaranteed parking.",
  },
  {
    id: 5,
    category: "payment",
    icon: TbFileText,
    question: "What is your cancellation policy?",
    answer:
      "We offer flexible cancellation on most properties. Free cancellation up to 48 hours before check-in. Some premium properties may have different policies — you'll see the specific terms during booking.",
  },
  {
    id: 6,
    category: "payment",
    icon: TbCreditCard,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and bank transfers. All transactions are secured with 256-bit encryption.",
  },
  {
    id: 7,
    category: "amenities",
    icon: TbPool,
    question: "Do all properties have a pool?",
    answer:
      "Not all, but many of our Miami properties feature private or shared pools. You can filter by pool access when browsing listings to find your ideal stay.",
  },
  {
    id: 8,
    category: "amenities",
    icon: TbWifi,
    question: "Is Wi-Fi included in all properties?",
    answer:
      "Yes! All StayWise properties include complimentary high-speed Wi-Fi. Many also feature dedicated workspaces perfect for remote working.",
  },
  {
    id: 9,
    category: "booking",
    icon: TbUserHeart,
    question: "Can I request special arrangements?",
    answer:
      "Absolutely! Our concierge team can arrange airport transfers, grocery delivery, restaurant reservations, yacht charters, and more. Just let us know what you need.",
  },
  {
    id: 10,
    category: "stay",
    icon: TbMapPin,
    question: "Which Miami neighborhoods do you cover?",
    answer:
      "We have properties in South Beach, Brickell, Coconut Grove, Wynwood, Design District, Key Biscayne, and more. Each neighborhood offers a unique Miami experience.",
  },
];

/* ── Single FAQ accordion item ── */
const FAQItem = ({ faq, isOpen, onToggle }) => {
  const Icon = faq.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE }}
      className="group"
    >
      <div
        className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
          isOpen
            ? "border-[#e8527a]/20 bg-white shadow-lg shadow-[#e8527a]/5"
            : "border-gray-100 bg-white/80 shadow-sm hover:border-[#e8527a]/15 hover:shadow-md"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-11 sm:w-11 ${
              isOpen
                ? "bg-[#e8527a] text-white shadow-lg shadow-[#e8527a]/25"
                : "bg-[#e8527a]/8 text-[#e8527a] group-hover:bg-[#e8527a]/15"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <h3
            className={`flex-1 text-sm font-bold transition-colors duration-200 sm:text-[15px] ${
              isOpen ? "text-[#0d3347]" : "text-[#0d3347] group-hover:text-[#e8527a]"
            }`}
          >
            {faq.question}
          </h3>

          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 sm:h-8 sm:w-8 ${
              isOpen
                ? "bg-[#e8527a] text-white"
                : "bg-gray-100 text-gray-400 group-hover:bg-[#e8527a]/10 group-hover:text-[#e8527a]"
            }`}
          >
            {isOpen ? (
              <TbMinus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <TbPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pl-[3.25rem] sm:px-5 sm:pb-5 sm:pl-[4.25rem]">
                <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ══════ MAIN PAGE ══════ */
const FAQPage = () => {
  const [openId, setOpenId] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      <SEOHead
        title="FAQ - Frequently Asked Questions"
        description="Find answers to common questions about booking, staying, and experiencing the best of Miami with StayWise."
      />

      <main className="relative overflow-hidden bg-[#fff7fa]">
        {/* HERO SECTION - SAME STYLE AS POLICY AND TERMS PAGES */}
        <section className="relative min-h-[480px] overflow-hidden pt-20 sm:min-h-[620px] sm:pt-28">
          <div className="absolute inset-0">
            <img
              src={HERO_IMAGE}
              alt="StayWise luxury vacation home"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-0" />
          </div>

          <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl pb-12 pt-6 sm:pb-20 sm:pt-10"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)] sm:text-sm">
                FAQ
              </p>

              <h1 className="mt-4 font-display text-4xl font-black leading-tight text-[#07142f] sm:mt-5 sm:text-5xl lg:text-6xl xl:text-7xl">
                Everything you
                <br />
                <span className="italic text-[var(--color-primary)]">
                  need to know
                </span>
              </h1>

              <div className="mt-4 h-[2px] w-12 bg-[var(--color-primary)] sm:mt-6 sm:w-16" />

              <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed !text-white sm:mt-6 sm:text-base sm:leading-8">
                Find answers to the most common questions about booking, staying,
                and experiencing the best of Miami with StayWise.
              </p>
            </motion.div>

            {/* TRUST BADGES - MATCHING POLICY/TERMS STYLE */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="relative z-20 mb-4 grid gap-3 rounded-2xl bg-white/90 p-4 shadow-[0_22px_70px_rgba(255,79,123,0.14)] ring-1 ring-pink-100 backdrop-blur sm:gap-4 sm:rounded-3xl sm:p-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;

                return (
                  <motion.div
                    key={badge.title}
                    whileHover={{ y: -5 }}
                    className={`flex items-center gap-3 rounded-xl p-2 sm:gap-4 sm:p-3 ${
                      index !== 0 && index !== 2 ? "md:border-l md:border-pink-100" : ""
                    } ${
                      index !== 0 ? "lg:border-l lg:border-pink-100" : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-pink-100 sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#07142f] sm:text-base">
                        {badge.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                        {badge.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* FAQ CONTENT SECTION */}
        <section className="relative pb-16 pt-12 sm:pb-20 sm:pt-24 lg:pb-28">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
            }}
          />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[var(--color-primary-light)] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-pink-100/70 blur-3xl" />

          <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
              {/* LEFT: Image + info card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="lg:col-span-5"
              >
                <div className="relative">
                  {/* Main image */}
                  <div className="group overflow-hidden rounded-2xl shadow-xl lg:rounded-3xl">
                    <img
                      src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=85"
                      alt="Miami palm trees and skyline at sunset"
                      className="h-[260px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[320px] lg:h-[420px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#e8527a]/10 via-transparent to-transparent" />
                  </div>

                  {/* Floating info card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
                    className="absolute -bottom-5 -right-2 w-48 rounded-xl border border-pink-100/60 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:-bottom-6 sm:-right-4 sm:w-56 lg:-bottom-8 lg:-right-6 lg:w-60 lg:p-5"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8527a]/8 sm:h-12 sm:w-12">
                      <TbHomeHeart className="h-5 w-5 text-[#e8527a] sm:h-6 sm:w-6" />
                    </div>

                    <h3
                      className="text-sm font-black text-[#0d3347] sm:text-base lg:text-lg"
                      style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                      Handpicked
                      <br />
                      With Love
                    </h3>

                    <div className="mt-2 h-[2px] w-8 rounded-full bg-[#e8527a]/30" />

                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      Every StayWise home is personally inspected to ensure an
                      unforgettable experience.
                    </p>

                    <Link
                      to="/properties"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#e8527a] transition-colors duration-200 hover:text-[#d4405f]"
                    >
                      Learn more
                      <TbArrowRight className="h-3 w-3" />
                    </Link>
                  </motion.div>
                </div>

                {/* Desktop CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-10 hidden rounded-2xl border border-[#e8527a]/15 bg-gradient-to-r from-[#fdf2f5] to-white p-5 lg:block lg:p-6"
                >
                  <h3 className="text-base font-black text-[#0d3347]">
                    Still have questions?
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Our concierge team is available 24/7 to help.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      to="/contact"
                      className="group inline-flex items-center gap-2 rounded-xl bg-[#e8527a] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#e8527a]/25 transition-all duration-200 hover:bg-[#d4405f] hover:shadow-xl sm:px-5 sm:py-2.5"
                    >
                      <TbMail className="h-3.5 w-3.5" />
                      Contact Us
                      <HiArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href={`tel:${APP_CONFIG.phoneHref}`}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0d3347] px-4 py-2 text-xs font-bold text-[#0d3347] transition-all duration-200 hover:bg-[#0d3347] hover:text-white sm:px-5 sm:py-2.5"
                    >
                      <TbPhone className="h-3.5 w-3.5" />
                      Call Us
                    </a>
                  </div>
                </motion.div>
              </motion.div>

              {/* RIGHT: FAQ Accordion */}
              <div className="lg:col-span-7">
                {/* Category filter pills - scrollable on mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 flex flex-nowrap gap-2 overflow-x-auto pb-2 sm:mb-6 sm:flex-wrap sm:overflow-visible sm:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                      activeCategory === "all"
                        ? "bg-[#e8527a] text-white shadow-lg shadow-[#e8527a]/25"
                        : "bg-gray-100 text-gray-500 hover:bg-[#e8527a]/10 hover:text-[#e8527a]"
                    }`}
                  >
                    All
                  </button>
                  {faqCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`whitespace-nowrap inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm ${
                          activeCategory === cat.id
                            ? "bg-[#e8527a] text-white shadow-lg shadow-[#e8527a]/25"
                            : "bg-gray-100 text-gray-500 hover:bg-[#e8527a]/10 hover:text-[#e8527a]"
                        }`}
                      >
                        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </motion.div>

                {/* Accordion list */}
                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {filteredFaqs.map((faq) => (
                      <FAQItem
                        key={faq.id}
                        faq={faq}
                        isOpen={openId === faq.id}
                        onToggle={() =>
                          setOpenId(openId === faq.id ? null : faq.id)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* FAQ count */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-4 text-center text-[10px] font-medium text-gray-300 sm:text-[11px]"
                >
                  Showing {filteredFaqs.length} of {faqs.length} questions
                </motion.p>
              </div>
            </div>

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-8 rounded-2xl border border-[#e8527a]/15 bg-gradient-to-r from-[#fdf2f5] to-white p-5 lg:hidden sm:mt-10 sm:p-6"
            >
              <h3 className="text-base font-black text-[#0d3347]">
                Still have questions?
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Our concierge team is available 24/7 to help.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#e8527a] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#e8527a]/25 transition-all duration-200 hover:bg-[#d4405f] sm:px-5 sm:py-2.5"
                >
                  <TbMail className="h-3.5 w-3.5" />
                  Contact Us
                  <HiArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={`tel:${APP_CONFIG.phoneHref}`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0d3347] px-4 py-2 text-xs font-bold text-[#0d3347] transition-all duration-200 hover:bg-[#0d3347] hover:text-white sm:px-5 sm:py-2.5"
                >
                  <TbPhone className="h-3.5 w-3.5" />
                  Call Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default FAQPage;