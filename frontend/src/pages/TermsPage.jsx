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

  return (
    <>
      <SEOHead
        title="Terms & Conditions"
        description="StayWise Terms and Conditions for bookings, payments, cancellations, guest responsibilities, and property rules."
      />

      <main className="relative overflow-hidden bg-[#fff7fa]">
        <section className="relative min-h-[620px] overflow-hidden pt-28">
          <div className="absolute inset-0">
            <img
              src={TACBg}
              alt="StayWise luxury vacation home"
              className="h-full w-full object-cover"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/25" /> */}
            {/* <div className="absolute inset-0 bg-gradient-to-b from-[#fff7fa]/10 via-transparent to-[#fff7fa]" /> */}
          </div>

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl pb-20 pt-10"
            >
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--color-primary)]">
                Terms & Conditions
              </p>

              <h1 className="mt-5 font-display text-5xl font-black leading-tight text-[#07142f] sm:text-6xl lg:text-7xl">
                Clear terms,
                <br />
                <span className="italic text-[var(--color-primary)]">
                  complete transparency
                </span>
              </h1>

              <div className="mt-6 h-[2px] w-16 bg-[var(--color-primary)]" />

              <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#26344f]">
                These terms and conditions outline the rules and regulations for
                the use of StayWise services.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="relative z-20 mb-4 grid gap-4 rounded-3xl bg-white/90 p-5 shadow-[0_22px_70px_rgba(255,79,123,0.14)] ring-1 ring-pink-100 backdrop-blur lg:grid-cols-4"
            >
              {trustItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -5 }}
                    className={`flex items-center gap-4 rounded-2xl p-3 ${index !== 0 ? "lg:border-l lg:border-pink-100" : ""
                      }`}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-pink-100">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="font-black text-[#07142f]">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="relative pb-20 pt-24">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
            }}
          />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[var(--color-primary-light)] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-pink-100/70 blur-3xl" />

          <div className="container-custom relative z-10 grid gap-7 lg:grid-cols-[310px_1fr]">
            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl bg-white/95 p-6 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur"
              >
                <p className="mb-5 text-sm font-black text-[#07142f]">
                  On This Page
                </p>

                <nav className="space-y-1">
                  {pageLinks.map((link, index) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() =>
                        index < termsSections.length && setOpenIndex(index)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${openIndex === index
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "text-[#26344f] hover:bg-pink-50 hover:text-[var(--color-primary)]"
                        }`}
                    >
                      <span>
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

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-white/95 p-5 shadow-[0_18px_55px_rgba(255,79,123,0.12)] ring-1 ring-pink-100 backdrop-blur sm:p-7"
            >
              <div className="mb-5 flex items-start gap-4 rounded-2xl bg-white p-4">
                <HiClipboardList className="h-8 w-8 shrink-0 text-[var(--color-primary)]" />
                <p className="text-sm font-medium leading-7 text-[#26344f]">
                  By accessing or using StayWise, you agree to be bound by these
                  Terms & Conditions. Please read them carefully before booking
                  or using our services.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-pink-100">
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
                        className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-pink-50 sm:px-6"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                          <Icon className="h-7 w-7" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-black text-[#07142f]">
                            {index + 1}. {section.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {section.content}
                          </p>
                        </div>

                        <HiChevronDown
                          className={`h-5 w-5 text-[var(--color-primary)] transition-transform ${isOpen ? "rotate-180" : ""
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
                            <div className="px-4 pb-5 pl-[88px] text-sm leading-7 text-gray-600 sm:px-6 sm:pl-[104px]">
                              {section.content} StayWise may update this section
                              from time to time to improve transparency,
                              compliance, and guest protection.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex justify-center">
                <a
                  href="/terms"
                  className="group inline-flex items-center gap-2 text-sm font-black text-[var(--color-primary)]"
                >
                  View All Terms & Conditions
                  <HiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsPage;