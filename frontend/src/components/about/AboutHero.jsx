import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowRight,
  HiLocationMarker,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi';
import { FaConciergeBell } from 'react-icons/fa';
import { THEME } from '../../config/theme.config';

const trustItems = [
  { icon: HiShieldCheck, label: 'Verified homes' },
  { icon: FaConciergeBell, label: 'Local concierge' },
  { icon: HiSparkles, label: 'Curated experiences' },
];

export default function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#062B3A] pt-28 text-white lg:pt-36">
      <img
        src={THEME.hero.heroImage}
        alt="Miami luxury stays"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,43,58,0.96),rgba(6,43,58,0.78)_48%,rgba(6,43,58,0.24))]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#062B3A] to-transparent" />

      <div className="container-custom relative z-10 pb-20">
        <div className="grid min-h-[620px] items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              About Miami Luxury Stays
            </p>
            <h1 className="mt-5 max-w-4xl font-hero text-6xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              Local taste.
              <br />
              Luxury stays.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/78">
              We pair Miami's best neighborhoods with homes that feel effortless:
              polished interiors, dependable service, and local support that helps every
              guest arrive confident.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
                Explore Stays
                <HiArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-[var(--color-text-primary)]">
                Talk to Concierge
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.10] px-4 py-3 text-sm font-bold text-white/[0.86] backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="rounded-lg border border-white/[0.14] bg-white/[0.10] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur">
              <div className="rounded-lg bg-white p-5 text-[var(--color-text-primary)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <HiLocationMarker className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--color-text-muted)]">
                      Miami coverage
                    </p>
                    <p className="text-xl font-black">Beach, bay, skyline, and village stays</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    ['1K+', 'Handpicked homes'],
                    ['24/7', 'Guest support'],
                    ['4.9', 'Average rating'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg bg-[var(--color-bg-medium)] p-4 text-center">
                      <p className="font-hero text-3xl font-black text-[var(--color-primary)]">
                        {value}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[var(--color-text-muted)]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
