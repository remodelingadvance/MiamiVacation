import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import {
  HiLocationMarker,
  HiUserGroup,
  HiStar,
  HiHome,
  HiShieldCheck,
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi";
import backgroundImage from "../../assets/palm-sketch.png";

const stats = [
  {
    icon: HiLocationMarker,
    value: "50+",
    label: "Miami Locations",
    sub: "Prime destinations",
  },
  {
    icon: HiHome,
    value: "500+",
    label: "Verified Stays",
    sub: "Quality checked homes",
  },
  {
    icon: HiUserGroup,
    value: "12K+",
    label: "Happy Guests",
    sub: "Trusted travelers",
  },
  {
    icon: HiStar,
    value: "4.9★",
    label: "Average Rating",
    sub: "Guest satisfaction",
  },
];

const AboutStayWiseBanner = () => {
  return (
    <section className="relative overflow-hidden bg-[#f7f1e8]">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        }}
      />
      {/* Desktop Image */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ clipPath: "polygon(52% 0, 100% 0, 100% 100%, 36% 100%)" }}
      >
        <motion.img
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=2200&q=80"
          alt="Miami vacation stay"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/20 to-black/55" />
      </div>

      {/* Mobile Image */}
      <div className="relative h-64 sm:h-80 lg:hidden">
        <img
          src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1200&q=80"
          alt="Miami vacation stay"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase text-[var(--color-primary)] shadow-lg backdrop-blur">
            <HiSparkles className="h-4 w-4" />
            About StayWise
          </span>
        </div>
      </div>

      {/* Decorations */}
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-6"
          >
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mb-5 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/15 lg:inline-flex"
              >
                <HiShieldCheck className="h-4 w-4" />
                About StayWise
              </motion.div>

              <h2
                className="text-2xl font-black leading-tight text-[var(--color-secondary)] sm:text-3xl lg:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Trusted Partner for {' '}
                <span className="text-[var(--color-primary)]">Exceptional Vacation Stays</span>
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base sm:leading-8 mr-24">
                <p>
                  At StayWise, we are dedicated to helping travelers discover
                  comfortable, memorable, and hassle-free accommodations across
                  Miami&apos;s most desirable destinations.
                </p>

                <p>
                  Our mission is to provide guests with premium vacation rentals,
                  luxury condos, and personalized booking experiences designed
                  around convenience, comfort, and value.
                </p>

                <p>
                  Whether you&apos;re planning a family vacation, a romantic
                  getaway, a business trip, or a long-term stay, our team is
                  committed to making every journey seamless from booking to
                  check-out.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/properties"
                  className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] px-7 text-sm font-black text-white shadow-lg shadow-[var(--color-primary)]/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-[var(--color-secondary)] transition-all duration-500 group-hover:w-full" />
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Stays
                    <HiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link
                  to="/about"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--color-secondary)] px-7 text-sm font-black text-[var(--color-secondary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-secondary)] hover:text-white"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Follow
                </span>

                {[FaFacebookF, FaTwitter, FaInstagram, HiOutlineChatAlt2].map(
                  (Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ y: -3, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-secondary)] text-white transition-colors hover:bg-[var(--color-primary)]"
                      aria-label="Social"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.a>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Stats */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto max-w-xl lg:ml-auto"
            >

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 28, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: 0.3 + index * 0.08,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl sm:p-5"
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--color-primary)]/5 transition duration-500 group-hover:scale-150" />

                    <div className="relative mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white sm:h-11 sm:w-11">
                      <stat.icon className="h-5 w-5" />
                    </div>

                    <p
                      className="relative text-2xl font-black leading-none text-[var(--color-secondary)] sm:text-4xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stat.value}
                    </p>

                    <p className="relative mt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-dark)] sm:text-sm">
                      {stat.label}
                    </p>

                    <p className="relative mt-1 text-[11px] leading-4 text-[var(--color-text-muted)] sm:text-xs">
                      {stat.sub}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStayWiseBanner;