import { motion, animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  TbUsersGroup,
  TbStarFilled,
  TbHomeHeart,
  TbShieldLock,
  TbHeadset,
  TbHome,
  TbMapPin,
  TbAward,
  TbLifebuoy,
} from 'react-icons/tb';
import { GiPalmTree } from 'react-icons/gi';
import OurStoryBg from '../../assets/our-story-bg.png';
import OurStorySkyline from '../../assets/skyline.png';

const EASE = [0.21, 0.47, 0.32, 0.98];

const ASSETS = {
  bg: OurStoryBg,
  skyline: OurStorySkyline,
  hero: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  polaroid1:
    'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=400&q=80',
  polaroid2:
    'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=400&q=80',
};

const features = [
  {
    icon: TbHomeHeart,
    title: 'Curated With Care',
    desc: 'Every home is carefully selected for quality, comfort, and location.',
  },
  {
    icon: TbShieldLock,
    title: 'Trusted & Secure',
    desc: 'Verified properties, secure booking, and 24/7 support you can count on.',
  },
  {
    icon: GiPalmTree,
    title: 'Local Expertise',
    desc: 'Our local team lives in Miami and knows the city inside out.',
  },
  {
    icon: TbHeadset,
    title: 'Here For You',
    desc: "From planning to checkout, we're here to make your stay effortless.",
  },
];

const stats = [
  { icon: TbHome, to: 100, suffix: '+', label: 'Handpicked Properties' },
  { icon: TbMapPin, to: 15, suffix: '+', label: 'Prime Miami Locations' },
  { icon: TbAward, to: 4.9, decimals: 1, suffix: '★', label: 'Guest Rating' },
  { icon: TbLifebuoy, display: '24/7', label: 'Guest Support' },
];

function CountUp({ to, decimals = 0, duration = 1.6, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

const OurStory = () => {
  return (
    <section
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
      style={{ backgroundColor: 'var(--color-primary-light)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${ASSETS.bg})` }}
      />

      <div className="container-custom relative z-10">

        {/* ═══════════════════════════════════════════
            ROW 1 — Left text  |  Right arched image
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">

          {/* LEFT: copy */}
          <div className="lg:col-span-5">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-primary)] sm:text-sm"
            >
              Our Story
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-3 h-[3px] w-10 origin-left rounded-full bg-[var(--color-primary)]"
            />

            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className="mt-5 text-[2rem] font-black leading-[1.08] text-[var(--color-secondary)] sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              Built for the World.
              <br />
              Inspired by{' '}
              <span className="italic text-[var(--color-primary)]">Miami.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--color-text-muted)] sm:text-[15px]"
            >
              When guests come to Miami for sunshine, design, food, and
              waterfront energy, we make every stay exceptional. Founded by
              locals who love this city, StayWise was created to offer handpicked
              homes, seamless service, and authentic Miami experiences, so every
              trip feels personal from the first message.
            </motion.p>

            <motion.img
              src={ASSETS.skyline}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-6 w-full max-w-sm select-none"
            />
          </div>

          {/* RIGHT: arched image */}
          <div className="relative lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="group relative overflow-hidden shadow-[0_30px_70px_rgba(232,82,122,0.18)]"
              style={{
                borderRadius: '46% 6% 46% 6% / 4% 26% 4% 26%',
              }}
            >
              <img
                src={ASSETS.hero}
                alt="Luxury Miami waterfront villa with pool"
                className="h-[300px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 sm:h-[380px] lg:h-[440px] xl:h-[480px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ROW 2 — Polaroids + Quote  |  4 cards
        ═══════════════════════════════════════════ */}
        <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:mt-8 lg:mt-4 lg:grid-cols-12 lg:gap-5">

          {/* LEFT: polaroids + quote */}
          <div className="relative order-2 flex flex-col lg:order-1 lg:col-span-5">

            {/* Polaroid + quote wrapper */}
            <div className="relative flex flex-1 items-end">

              {/* Polaroids */}
              <div className="absolute -top-2 left-0 z-10 hidden h-48 w-44 sm:block lg:-top-6">
                <motion.div
                  initial={{ opacity: 0, y: 28, rotate: -14 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -8 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  whileHover={{ rotate: 0, scale: 1.06, zIndex: 20 }}
                  className="absolute left-0 top-0 w-28 cursor-pointer overflow-hidden rounded-md border-[3px] border-white shadow-xl sm:w-30"
                >
                  <img
                    src={ASSETS.polaroid1}
                    alt="Miami beach sunset"
                    className="h-32 w-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 28, rotate: 14 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  whileHover={{ rotate: 0, scale: 1.06, zIndex: 20 }}
                  className="absolute bottom-0 right-0 w-28 cursor-pointer overflow-hidden rounded-md border-[3px] border-white shadow-xl sm:w-30"
                >
                  <img
                    src={ASSETS.polaroid2}
                    alt="Miami Art Deco"
                    className="h-32 w-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Mobile polaroids */}
              <div className="relative mx-auto mb-4 flex h-40 w-40 sm:hidden">
                <motion.div
                  initial={{ opacity: 0, rotate: -10 }}
                  whileInView={{ opacity: 1, rotate: -8 }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  className="absolute left-0 top-0 w-24 cursor-pointer overflow-hidden rounded-md border-[3px] border-white shadow-lg"
                >
                  <img src={ASSETS.polaroid1} alt="Miami" className="h-28 w-full object-cover" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, rotate: 10 }}
                  whileInView={{ opacity: 1, rotate: 6 }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  className="absolute bottom-0 right-0 w-24 cursor-pointer overflow-hidden rounded-md border-[3px] border-white shadow-lg"
                >
                  <img src={ASSETS.polaroid2} alt="Miami" className="h-28 w-full object-cover" />
                </motion.div>
              </div>

              {/* Quote card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
                className="w-full overflow-hidden rounded-2xl border border-pink-100/60 bg-white/90 p-5 shadow-[0_18px_44px_rgba(232,82,122,0.1)] backdrop-blur-sm sm:ml-36 sm:rounded-[20px] sm:p-6 lg:ml-40"
              >
                <span className="absolute right-4 top-0 select-none font-serif text-5xl leading-none text-[var(--color-primary)]/10">
                  "
                </span>
                <span className="font-serif text-3xl leading-none text-[var(--color-primary)] sm:text-4xl">
                  "
                </span>
                <p
                  className="mt-1 text-base font-bold leading-snug text-[var(--color-secondary)] sm:text-lg"
                  style={{ fontFamily: 'var(--font-display, serif)' }}
                >
                  More than a stay,
                  <br />
                  it's a Miami experience.
                </p>
                <p
                  className="mt-2.5 flex items-center gap-1.5 text-lg text-[var(--color-primary)] sm:text-xl"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Stay Wise, Stay Miami
                  <GiPalmTree className="h-4 w-4" />
                </p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: 4 feature cards */}
          <div className="order-1 grid grid-cols-2 gap-3 lg:order-2 lg:col-span-7 lg:grid-cols-4 lg:gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: EASE }}
                  className="group"
                >
                  <div className="flex h-full flex-col items-center overflow-hidden rounded-2xl border border-pink-100/60 bg-white/90 px-3 py-6 text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)]/20 hover:shadow-xl sm:rounded-[20px] sm:px-4 sm:py-7 lg:px-3 lg:py-6">

                    {/* Icon circle */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-light)] transition-all duration-200 group-hover:bg-[var(--color-primary)] group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl">
                      <Icon className="h-6 w-6 text-[var(--color-primary)] transition-colors duration-200 group-hover:text-white sm:h-7 sm:w-7" />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-[13px] font-black leading-snug text-[var(--color-secondary)] transition-colors duration-200 group-hover:text-[var(--color-primary)] sm:text-sm lg:text-[13px] xl:text-sm"
                      style={{ fontFamily: 'var(--font-display, serif)' }}
                    >
                      {f.title}
                    </h3>

                    {/* Accent line */}
                    <div className="mx-auto mt-2 h-[2px] w-5 rounded-full bg-[var(--color-primary)]/30 transition-all duration-300 group-hover:w-8 group-hover:bg-[var(--color-primary)]" />

                    {/* Description */}
                    <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:text-xs">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ROW 3 — Stats bar
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-6 overflow-hidden rounded-2xl border border-pink-100/60 bg-white/90 shadow-[0_18px_44px_rgba(232,82,122,0.08)] backdrop-blur-sm sm:mt-8 sm:rounded-[20px]"
        >
          <div className="grid grid-cols-2 divide-x divide-pink-100/60 lg:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.07 }}
                  className="group flex items-center gap-3 px-4 py-4 transition-all duration-200 hover:bg-pink-50/40 sm:gap-4 sm:px-6 sm:py-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/20 transition-all duration-200 group-hover:bg-[var(--color-primary)] group-hover:ring-0 group-hover:scale-110 sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5 text-[var(--color-primary)] transition-colors duration-200 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-black leading-none text-[var(--color-secondary)] sm:text-xl">
                      {s.display ? (
                        s.display
                      ) : (
                        <>
                          <CountUp to={s.to} decimals={s.decimals || 0} />
                          {s.suffix}
                        </>
                      )}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-[var(--color-text-muted)] sm:text-xs">
                      {s.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;