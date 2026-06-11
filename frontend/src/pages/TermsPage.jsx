import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCalendar,
  HiClipboardList,
  HiDocumentText,
  HiHome,
  HiScale,
  HiShieldCheck,
  HiSupport,
  HiUser,
  HiCreditCard,
  HiX,
  HiChevronDown,
  HiChevronRight,
  HiArrowRight,
} from "react-icons/hi";
import SEOHead from "../components/common/SEOHead";
import TACBg from "../assets/tac-bg.png";
import backgroundImage from "../assets/termbg.png";

const termsSections = [
  {
    title: "Acceptance of Terms",
    icon: HiDocumentText,
    content: `
By accessing, browsing, or using the StayWise website and services, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of our platform immediately. These terms apply to all visitors, guests, property owners, and users of our services.
    `,
  },
  {
    title: "Use of Our Services",
    icon: HiUser,
    content: `
StayWise provides an online platform for discovering, booking, and managing vacation rental properties in Miami and surrounding areas. You agree to use our services only for lawful purposes and in accordance with applicable local, state, and federal laws. Any misuse of the platform, including fraudulent bookings, unauthorized access, or interference with platform functionality, is strictly prohibited.
    `,
  },
  {
    title: "Booking & Payments",
    icon: HiCreditCard,
    content: `
All reservations are subject to property availability and confirmation. Guests must provide accurate booking information and complete payment requirements before a reservation is confirmed. StayWise reserves the right to refuse or cancel bookings that contain inaccurate information, suspected fraud, or violations of these terms. Additional fees, taxes, security deposits, and service charges may apply depending on the selected property.
    `,
  },
  {
    title: "Cancellations & Refunds",
    icon: HiCalendar,
    content: `
Cancellation and refund policies vary by property and reservation type. Guests are responsible for reviewing the specific cancellation policy displayed during the booking process. Refund eligibility, processing times, and applicable deductions are determined according to the property's cancellation policy and applicable laws. StayWise may charge administrative fees where permitted.
    `,
  },
  {
    title: "Guest Responsibilities",
    icon: HiHome,
    content: `
Guests are expected to treat all properties with care and respect. You are responsible for maintaining the condition of the property during your stay and for the actions of all individuals included in your reservation. Any damages, excessive cleaning requirements, missing items, or violations of house rules may result in additional charges, security deposit deductions, or immediate termination of your stay.
    `,
  },
  {
    title: "Property Rules",
    icon: HiShieldCheck,
    content: `
Each property may have specific house rules regarding occupancy limits, noise restrictions, smoking policies, pet policies, parking regulations, and check-in/check-out procedures. Guests must comply with all property-specific rules as well as local laws and community regulations. Failure to comply may result in cancellation without refund.
    `,
  },
  {
    title: "Liability & Disclaimers",
    icon: HiSupport,
    content: `
StayWise acts as a booking platform and makes reasonable efforts to ensure property information is accurate. However, we do not guarantee that descriptions, amenities, photographs, or availability are error-free. StayWise shall not be liable for interruptions, property defects, weather events, transportation issues, injuries, losses, or damages arising from your use of the property or services except as required by applicable law.
    `,
  },
  {
    title: "Intellectual Property",
    icon: HiCreditCard,
    content: `
All content on the StayWise website, including logos, branding, text, graphics, photographs, videos, designs, and software, is protected by intellectual property laws and remains the property of StayWise or its licensors. Users may not copy, reproduce, distribute, modify, or exploit any content without prior written permission.
    `,
  },
  {
    title: "Changes to Terms",
    icon: HiHome,
    content: `
StayWise reserves the right to update, modify, or replace these Terms & Conditions at any time. Changes become effective immediately upon publication on our website. Continued use of our services after updates constitutes acceptance of the revised terms. We encourage users to review these terms periodically.
    `,
  },
  {
    title: "Governing Law",
    icon: HiScale,
    content: `
These Terms & Conditions shall be governed and interpreted in accordance with the laws of the State of Florida, United States, without regard to conflict of law principles. Any disputes arising from these terms or use of our services shall be subject to the exclusive jurisdiction of the courts located in Miami-Dade County, Florida.
    `,
  },
  {
    title: "Contact Information",
    icon: HiUser,
    content: `
If you have any questions regarding these Terms & Conditions, booking policies, or your rights and obligations, please contact StayWise through our Contact Us page or customer support team. We are committed to providing prompt assistance and resolving concerns professionally.
    `,
  },
];

const pageLinks = [
  "Acceptance of Terms",
  "Use of Our Services",
  "Booking & Payments",
  "Cancellations & Refunds",
  "Guest Responsibilities",
  "Property Rules",
  "Liability & Disclaimers",
  "Intellectual Property",
  "Changes to Terms",
  "Governing Law",
  "Contact Information",
];

const trustItems = [
  {
    icon: HiShieldCheck,
    title: "Fair & Transparent",
    text: "No hidden terms.",
  },
  {
    icon: HiDocumentText,
    title: "User Protection",
    text: "Your rights matter.",
  },
  {
    icon: HiSupport,
    title: "Clear Guidelines",
    text: "Easy to understand.",
  },
  {
    icon: HiScale,
    title: "Legally Compliant",
    text: "Industry standard.",
  },
];

const TermsPage = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Get current section title for mobile header
  const currentSectionTitle = pageLinks[openIndex] || "Terms & Conditions";

  return (
    <>
      <SEOHead
        title="Terms & Conditions"
        description="StayWise Terms and Conditions for bookings, payments, cancellations, guest responsibilities, and property rules."
      />

      <main className="relative overflow-hidden bg-[#fff7fa]">
        {/* HERO SECTION - RESPONSIVE */}
        <section className="relative min-h-[480px] overflow-hidden pt-20 sm:min-h-[620px] sm:pt-28">
          <div className="absolute inset-0">
            <img
              src={TACBg}
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
                Terms & Conditions
              </p>

              <h1 className="mt-4 font-display text-4xl font-black leading-tight text-[#07142f] sm:mt-5 sm:text-5xl lg:text-6xl xl:text-7xl">
                Clear terms,
                <br />
                <span className="italic text-[var(--color-primary)]">
                  complete transparency
                </span>
              </h1>

              <div className="mt-4 h-[2px] w-12 bg-[var(--color-primary)] sm:mt-6 sm:w-16" />

              <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#26344f] sm:mt-6 sm:text-base sm:leading-8">
                These terms and conditions outline the rules and regulations for
                the use of StayWise services.
              </p>
            </motion.div>

            {/* TRUST BADGES - RESPONSIVE GRID */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="relative z-20 mb-4 grid gap-3 rounded-2xl bg-white/90 p-4 shadow-[0_22px_70px_rgba(255,79,123,0.14)] ring-1 ring-pink-100 backdrop-blur sm:gap-4 sm:rounded-3xl sm:p-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {trustItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
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
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* MAIN CONTENT SECTION */}
        <section className="relative pb-16 pt-12 sm:pb-20 sm:pt-24">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
            }}
          />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[var(--color-primary-light)] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-pink-100/70 blur-3xl" />

          <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[310px_1fr] lg:gap-7">
              {/* LEFT SIDEBAR - DESKTOP & MOBILE DRAWER */}
              {/* Mobile Sidebar Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white/95 px-4 py-3 text-left shadow-[0_8px_25px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      <HiDocumentText className="h-4 w-4" />
                    </span>
                    <span className="font-black text-[#07142f] text-sm">
                      {currentSectionTitle}
                    </span>
                  </span>
                  <HiChevronRight
                    className={`h-5 w-5 text-[var(--color-primary)] transition-transform duration-200 ${
                      isMobileSidebarOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isMobileSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 overflow-hidden rounded-2xl bg-white/95 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
                    >
                      <div className="p-3">
                        <p className="mb-3 px-2 text-xs font-black text-[#07142f]">
                          On This Page
                        </p>
                        <nav className="flex flex-col gap-1">
                          {pageLinks.map((link, index) => (
                            <button
                              key={link}
                              type="button"
                              onClick={() => {
                                if (index < termsSections.length) {
                                  setOpenIndex(index);
                                  setIsMobileSidebarOpen(false);
                                }
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                                openIndex === index
                                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                  : "text-[#26344f] hover:bg-pink-50 hover:text-[var(--color-primary)]"
                              }`}
                            >
                              <span className="text-sm">
                                {index + 1}. {link}
                              </span>
                              <HiChevronRight className="h-3.5 w-3.5" />
                            </button>
                          ))}
                        </nav>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Sidebar */}
              <aside className="hidden lg:block space-y-5 lg:sticky lg:top-28 lg:self-start">
                <motion.div
                  initial={{ opacity: 0, x: -22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl bg-white/95 p-6 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
                >
                  <p className="mb-5 text-sm font-black text-[#07142f]">
                    On This Page
                  </p>

                  <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                    {pageLinks.map((link, index) => (
                      <button
                        key={link}
                        type="button"
                        onClick={() =>
                          index < termsSections.length && setOpenIndex(index)
                        }
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          openIndex === index
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                            : "text-[#26344f] hover:bg-pink-50 hover:text-[var(--color-primary)]"
                        }`}
                      >
                        <span className="text-sm">
                          {index + 1}. {link}
                        </span>
                        <HiChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </nav>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -22 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="rounded-3xl bg-white/95 p-6 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      <HiSupport className="h-8 w-8" />
                    </div>

                    <div>
                      <p className="font-black text-[#07142f]">Need Help?</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Our support team is here for you.
                      </p>
                    </div>
                  </div>

                  <a
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--color-primary)]"
                  >
                    Contact Support
                    <HiArrowRight className="h-4 w-4" />
                  </a>
                </motion.div>
              </aside>

              {/* RIGHT CONTENT - RESPONSIVE ACCORDION */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/95 p-4 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur sm:rounded-3xl sm:p-5 md:p-7"
              >
                {/* Important Notice Banner */}
                <div className="mb-5 flex items-start gap-3 rounded-xl bg-white p-3 sm:gap-4 sm:rounded-2xl sm:p-4">
                  <HiClipboardList className="h-6 w-6 shrink-0 text-[var(--color-primary)] sm:h-8 sm:w-8" />
                  <p className="text-xs font-medium leading-relaxed text-[#26344f] sm:text-sm sm:leading-7">
                    By accessing or using StayWise, you agree to be bound by these
                    Terms & Conditions. Please read them carefully before booking
                    or using our services.
                  </p>
                </div>

                {/* Accordion Sections */}
                <div className="overflow-hidden rounded-xl border border-pink-100 sm:rounded-3xl">
                  {termsSections.map((section, index) => {
                    const Icon = section.icon;
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={section.title}
                        className="border-b border-pink-100 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenIndex(isOpen ? -1 : index)}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-pink-50 sm:gap-4 sm:px-5 sm:py-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] sm:h-14 sm:w-14 sm:rounded-2xl">
                            <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-sm font-black text-[#07142f] sm:text-base">
                              {index + 1}. {section.title}
                            </h3>
                            <p className="hidden text-xs text-gray-500 line-clamp-1 sm:mt-1 sm:block sm:text-sm">
                              {section.content.substring(0, 80)}...
                            </p>
                          </div>

                          <HiChevronDown
                            className={`h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform sm:h-5 sm:w-5 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-4 pl-[52px] text-xs leading-relaxed text-gray-600 sm:px-5 sm:pb-5 sm:pl-[88px] sm:text-sm sm:leading-7">
                                {section.content}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Link */}
                <div className="mt-6 flex justify-center sm:mt-7">
                  <a
                    href="/terms"
                    className="group inline-flex items-center gap-1 text-xs font-black text-[var(--color-primary)] sm:gap-2 sm:text-sm"
                  >
                    View All Terms & Conditions
                    <HiArrowRight className="h-3 w-3 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsPage;