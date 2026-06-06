import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiHeart,
  HiLocationMarker,
  HiPhone,
  HiShieldCheck,
} from 'react-icons/hi';
import { useRef, useState } from 'react';
import BgImage from '../../assets/aboutBg.png';

const EXPERIENCES = [
  {
    title: 'Beach Days',
    desc: 'Umbrellas, ocean air, and easy access to Miami Beach.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=85',
    accent: '#FF4F7B',
  },
  {
    title: 'Dining & Nightlife',
    desc: 'Concierge picks for rooftops, tasting menus, and late nights.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=700&q=85',
    accent: '#FFD166',
  },
  {
    title: 'Yacht Days',
    desc: 'Private charters, bay cruises, and waterfront celebrations.',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=700&q=85',
    accent: '#00A9C8',
  },
  {
    title: 'Art Walks',
    desc: 'Wynwood walls, galleries, museums, and design districts.',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=700&q=85',
    accent: '#6C63FF',
  },
];

const TRUST = [
  { icon: HiLocationMarker, label: 'Prime locations' },
  { icon: HiShieldCheck, label: 'Secure booking' },
  { icon: HiPhone, label: '24/7 support' },
];

export default function ExperiencesSection() {
  const scroller = useRef(null);
  const [saved, setSaved] = useState(null);

  const scrollByCard = (direction) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * 260, behavior: 'smooth' });
  };

  return (
    <section
      className="w-full bg-white py-16"
      style={{
        backgroundImage: `url(${BgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container-custom">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Miami experiences
            </p>
            <h2 className="mt-3 max-w-3xl font-hero text-5xl font-black uppercase leading-[0.92] text-[var(--color-text-primary)] sm:text-6xl">
              More than a stay.
              <br />
              Make it a trip.
            </h2>
          </motion.div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] shadow-sm"
              aria-label="Previous experiences"
            >
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] shadow-sm"
              aria-label="Next experiences"
            >
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={scroller} className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
          {EXPERIENCES.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative min-h-[360px] w-[82vw] shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-[0_18px_48px_rgba(8,51,68,0.12)] ring-1 ring-black/5 sm:w-[360px]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062B3A]/92 via-[#062B3A]/22 to-transparent" />
              <button
                type="button"
                onClick={() => setSaved(saved === item.title ? null : item.title)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-[var(--color-text-primary)] shadow-lg"
                aria-label="Save experience"
              >
                <HiHeart
                  className={`h-5 w-5 ${
                    saved === item.title ? 'fill-current text-[var(--color-primary)]' : ''
                  }`}
                />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <span
                  className="mb-3 inline-flex rounded-lg px-3 py-1 text-xs font-black uppercase"
                  style={{ background: item.accent }}
                >
                  Curated
                </span>
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-white/78">
                  {item.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 grid gap-4 rounded-lg bg-[#062B3A] p-5 text-white shadow-[0_22px_64px_rgba(8,51,68,0.18)] lg:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              Book direct benefits
            </p>
            <h3 className="mt-2 font-hero text-4xl font-black uppercase leading-none">
              Stay polished from arrival to checkout
            </h3>
            <div className="mt-4 flex flex-wrap gap-4">
              {['Best price guidance', 'Flexible planning', 'Local guest support'].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm font-bold text-white/82">
                  <HiCheck className="h-4 w-4 text-[var(--color-accent)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:items-center">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-bold text-white/82">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.10]">
                  <Icon className="h-4 w-4 text-[var(--color-secondary)]" />
                </span>
                {label}
              </div>
            ))}
            <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
              Find Your Stay
              <HiArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
