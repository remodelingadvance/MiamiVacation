import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  HiOutlineHome,
  HiOutlineLocationMarker,
  HiOutlineStar,
  HiOutlineKey,
} from "react-icons/hi";
import VideoBackground from "../../assets/stat-vid.mp4";

const stats = [
  {
    label: "Vacation Homes",
    value: 10,
    suffix: "+",
    icon: HiOutlineHome,
    description: "Curated stays across Miami",
  },
  {
    label: "Average Rating",
    value: 4.9,
    suffix: "★",
    icon: HiOutlineStar,
    description: "From verified guest reviews",
    decimals: 1,
  },
  {
    label: "Miami Locations",
    value: 25,
    suffix: "+",
    icon: HiOutlineLocationMarker,
    description: "From South Beach to Brickell",
  },
  {
    label: "Years Experience",
    value: 10,
    suffix: "+",
    icon: HiOutlineKey,
    description: "Hosting dream vacations",
  },
];

const Counter = ({ value, decimals = 0, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(value * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toFixed(decimals)}</span>;
};

const EASE = [0.22, 1, 0.36, 1];

const StatsSection = ({ items = stats, videoSrc = VideoBackground }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Premium Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#062B3A]/85 via-black/55 to-[#051d28]/90" />
      <div className="absolute inset-0" />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full "
      />

      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-[#e8527a]"
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85 sm:text-[11px]">
              Why Travelers Choose StayWise
            </span>
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            Miami&apos;s Most Trusted{" "}
            <span className="bg-gradient-to-r from-[#e8527a] to-[#ff7a9c] bg-clip-text text-transparent">
              Vacation Platform
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-3 max-w-2xl text-sm text-white/65 sm:text-[15px]"
          >
            Numbers that reflect our commitment to creating unforgettable Miami
            vacation experiences for every guest.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: EASE,
                }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#e8527a]/40 hover:bg-white/[0.09] hover:shadow-2xl hover:shadow-[#e8527a]/20 sm:p-6"
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(232,82,122,0.18), transparent 50%, rgba(6,182,212,0.12))",
                    }}
                  />
                </div>

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e8527a]/25 to-[#e8527a]/5 text-[#ff7a9c] ring-1 ring-[#e8527a]/25 sm:mb-4 sm:h-14 sm:w-14"
                >
                  <Icon className="h-6 w-6 stroke-[1.5] sm:h-7 sm:w-7" />
                </motion.div>

                <div className="relative flex items-baseline gap-0.5">
                  <h3
                    className="text-2xl font-black leading-none text-white sm:text-3xl lg:text-4xl"
                    style={{ fontFamily: "var(--font-display, serif)" }}
                  >
                    <Counter
                      value={item.value}
                      decimals={item.decimals || 0}
                    />
                  </h3>

                  <span className="text-lg font-black text-[#e8527a] sm:text-xl">
                    {item.suffix}
                  </span>
                </div>

                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white/85 sm:text-xs">
                  {item.label}
                </p>

                <p className="mt-1 hidden text-[10px] leading-relaxed text-white/45 sm:block">
                  {item.description}
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "30%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.08 }}
                  className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#e8527a] to-transparent sm:mt-4"
                />

                <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#e8527a] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>

        {/* Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 sm:mt-14 sm:gap-x-10 sm:pt-8"
        >
          {[
            "Verified Properties",
            "24/7 Concierge",
            "Best Price Guarantee",
            "Secure Booking",
          ].map((label, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
              className="flex items-center gap-2 text-xs font-semibold text-white/70 transition-colors hover:text-white sm:text-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8527a]/15 text-[10px] font-black text-[#e8527a]">
                ✓
              </span>
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;