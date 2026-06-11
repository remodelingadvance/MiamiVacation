import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbShieldCheck,
  TbLock,
  TbUserCircle,
  TbSettings,
  TbUser,
  TbCalendarEvent,
  TbDeviceMobile,
  TbCookie,
  TbChevronRight,
  TbShieldHeart,
  TbArrowRight,
} from "react-icons/tb";
import SEOHead from "../components/common/SEOHead";
import HeroImg from "../assets/policy-bg.png";
import backgroundImage from "../assets/our-story-bg.png";

const EASE = [0.21, 0.47, 0.32, 0.98];

const HERO_IMAGE = HeroImg;

const trustBadges = [
  { icon: TbShieldCheck, title: "We Respect Your Privacy", desc: "Your data is yours." },
  { icon: TbLock, title: "Secure & Encrypted", desc: "Top-tier security standards." },
  { icon: TbUserCircle, title: "Transparent Practices", desc: "Clear and honest information." },
  { icon: TbSettings, title: "Your Control", desc: "Manage your preferences." },
];

const infoCards = [
  {
    icon: TbUser,
    title: "Personal Information",
    desc: "Name, email address, phone number, mailing address, and payment details.",
  },
  {
    icon: TbCalendarEvent,
    title: "Booking Information",
    desc: "Travel dates, guest details, preferences, and special requests.",
  },
  {
    icon: TbDeviceMobile,
    title: "Device & Usage Information",
    desc: "IP address, browser type, device information, and website activity.",
  },
  {
    icon: TbCookie,
    title: "Cookies & Tracking Data",
    desc: "Cookies help us improve performance, personalize content, and enhance your experience.",
  },
];

const sections = [
  {
    id: "collect",
    title: "Information We Collect",
    icon: TbUser,
    content:
      "We collect information you provide directly when you book a stay, contact us, or use our services.",
    cards: true,
    note:
      "We only collect information that helps us provide a better StayWise experience. We never sell your personal information.",
  },
  {
    id: "use",
    title: "How We Use Information",
    icon: TbSettings,
    content:
      "We use your information to process bookings, manage reservations, communicate updates, improve services, and comply with legal obligations.",
  },
  {
    id: "protect",
    title: "How We Protect Data",
    icon: TbLock,
    content:
      "We use technical and organizational safeguards to protect your information from unauthorized access, alteration, disclosure, or misuse.",
  },
  {
    id: "rights",
    title: "Your Rights & Choices",
    icon: TbShieldHeart,
    content:
      "You may request access, correction, deletion, or restriction of your personal information. You can also opt out of marketing communications anytime.",
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    icon: TbCookie,
    content:
      "We use cookies and similar technologies to improve browsing, analyze site traffic, remember preferences, and personalize your StayWise experience.",
  },
];

const PrivacyPolicyPage = () => {
  const [activeTab, setActiveTab] = useState(sections[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = sections.find((section) => section.id === activeTab);

  // For mobile: show selected section title and toggle menu
  const currentSectionTitle = activeSection?.title || "Privacy Sections";

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="StayWise Privacy Policy - Learn how we collect, use, and protect your personal information."
      />

      <main className="relative overflow-hidden bg-[#fff7fa]">
        {/* HERO SECTION - FIXED MOBILE SPACING */}
        <section className="relative min-h-[480px] overflow-hidden pt-20 sm:min-h-[620px] sm:pt-28">
          <div className="absolute inset-0">
            <img
              src={HERO_IMAGE}
              alt="StayWise luxury vacation home"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl pb-12 pt-6 sm:pb-20 sm:pt-10"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)] sm:text-sm">
                Privacy Policy
              </p>

              <h1 className="mt-4 font-display text-4xl font-black leading-tight text-[#07142f] sm:mt-5 sm:text-5xl lg:text-6xl xl:text-7xl">
                Your privacy,
                <br />
                <span className="italic text-[var(--color-primary)]">
                  our priority
                </span>
              </h1>

              <div className="mt-4 h-[2px] w-12 bg-[var(--color-primary)] sm:mt-6 sm:w-16" />

              <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#26344f] sm:mt-6 sm:text-base sm:leading-8">
                At StayWise, we protect your personal information and explain
                clearly how your data is collected, used, and safeguarded.
              </p>
            </motion.div>

            {/* TRUST BADGES - RESPONSIVE GRID */}
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

        {/* MAIN CONTENT SECTION - FULLY RESPONSIVE */}
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
            {/* MOBILE DROPDOWN SELECTOR */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex w-full items-center justify-between rounded-2xl bg-white/95 px-4 py-3 text-left shadow-[0_8px_25px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    {activeSection && <activeSection.icon className="h-4 w-4" />}
                  </span>
                  <span className="font-black text-[#07142f]">{currentSectionTitle}</span>
                </span>
                <TbChevronRight
                  className={`h-5 w-5 text-[var(--color-primary)] transition-transform duration-200 ${
                    isMobileMenuOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 overflow-hidden rounded-2xl bg-white/95 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
                  >
                    <nav className="flex flex-col p-2">
                      {sections.map((section, index) => {
                        const Icon = section.icon;
                        const active = activeTab === section.id;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(section.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-black transition-all ${
                              active
                                ? "bg-[var(--color-primary)] text-white"
                                : "text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>
                              {index + 1}. {section.title}
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DESKTOP SIDEBAR + CONTENT GRID */}
            <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:gap-7">
              {/* LEFT SIDEBAR TABS - DESKTOP ONLY */}
              <aside className="hidden lg:sticky lg:top-28 lg:self-start lg:block">
                <motion.div
                  initial={{ opacity: 0, x: -22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl bg-white/95 p-4 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur sm:p-6"
                >
                  <p className="mb-4 text-sm font-black text-[#07142f]">
                    Privacy Sections
                  </p>

                  <nav className="-mx-1 flex flex-col gap-2">
                    {sections.map((section, index) => {
                      const Icon = section.icon;
                      const active = activeTab === section.id;

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setActiveTab(section.id)}
                          className={`group flex shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all w-full ${
                            active
                              ? "bg-[var(--color-primary)] text-white shadow-lg shadow-pink-200"
                              : "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="whitespace-normal">
                              {index + 1}. {section.title}
                            </span>
                          </span>

                          <TbChevronRight
                            className={`hidden h-5 w-5 transition lg:block ${
                              active ? "translate-x-1" : "group-hover:translate-x-1"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              </aside>

              {/* RIGHT CONTENT - FULLY RESPONSIVE */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/95 p-4 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur sm:rounded-3xl sm:p-5 md:p-7"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex flex-col gap-4 border-b border-pink-100 pb-5 sm:flex-row sm:items-start sm:gap-5 sm:pb-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] sm:h-16 sm:w-16 sm:rounded-2xl">
                        <activeSection.icon className="h-7 w-7 sm:h-9 sm:w-9" />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase text-[var(--color-primary)]">
                          Privacy Information
                        </p>

                        <h2 className="mt-1 font-display text-2xl font-black text-[#07142f] sm:text-3xl md:text-4xl">
                          {activeSection.title}
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:mt-3 sm:text-base sm:leading-8">
                          {activeSection.content}
                        </p>
                      </div>
                    </div>

                    {activeSection.cards && (
                      <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
                        {infoCards.map((card, index) => {
                          const Icon = card.icon;

                          return (
                            <motion.div
                              key={card.title}
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.06 }}
                              whileHover={{ y: -3 }}
                              className="group rounded-2xl border border-pink-100 bg-[#fffafb] p-4 transition hover:shadow-[0_18px_45px_rgba(255,79,123,0.16)] sm:rounded-3xl sm:p-5"
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl">
                                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </span>

                                <div>
                                  <h3 className="text-sm font-black text-[#07142f] sm:text-base">
                                    {card.title}
                                  </h3>
                                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:mt-1 sm:text-sm sm:leading-7">
                                    {card.desc}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {activeSection.note && (
                      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[var(--color-primary-light)]/70 p-4 sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-3xl sm:p-5">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <TbShieldHeart className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)] sm:h-6 sm:w-6" />
                          <p className="text-xs leading-relaxed text-[#26344f] sm:text-sm sm:leading-7">
                            {activeSection.note}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab("cookies")}
                          className="group inline-flex shrink-0 items-center gap-2 text-xs font-black text-[var(--color-primary)] sm:text-sm"
                        >
                          Learn more
                          <TbArrowRight className="h-3 w-3 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <p className="mt-6 text-xs text-gray-500 sm:mt-8 sm:text-sm">
                  Last updated: January 1, 2026
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PrivacyPolicyPage;