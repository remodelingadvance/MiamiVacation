import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import backgroundImage from '../../assets/testimonial-bg.png';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'New York, USA',
    avatar: '/testimonials/sarah.jpg',
    rating: 5,
    text: 'Absolutely stunning penthouse! The ocean views were breathtaking, and the concierge service made our stay unforgettable. Will definitely be returning!',
    property: 'Oceanfront Penthouse',
    date: 'March 2024',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'San Francisco, USA',
    avatar: '/testimonials/michael.jpg',
    rating: 5,
    text: 'The Brickell condo exceeded all expectations. Modern design, impeccable cleanliness, and walking distance to the best restaurants. Perfect for our business trip!',
    property: 'Brickell Luxury Condo',
    date: 'February 2024',
  },
  {
    id: 3,
    name: 'Emma & James Wilson',
    location: 'London, UK',
    avatar: '/testimonials/emma-james.jpg',
    rating: 5,
    text: 'Our family vacation was magical thanks to Stay Wise. The villa had everything we needed, and the private pool was a hit with the kids. Truly a home away from home.',
    property: 'Miami Beach Villa',
    date: 'January 2024',
  },
  {
    id: 4,
    name: 'David Rodriguez',
    location: 'Miami, USA',
    avatar: '/testimonials/david.jpg',
    rating: 4,
    text: 'As a local, I booked for a staycation and was blown away. The attention to detail and premium amenities made me feel like I was at a 5-star resort. Highly recommend!',
    property: 'Downtown Penthouse',
    date: 'December 2023',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    location: 'Toronto, Canada',
    avatar: '/testimonials/lisa.jpg',
    rating: 5,
    text: "Best booking experience ever! The team was incredibly responsive, and the property was even better than the photos. Can't wait to come back next winter!",
    property: 'Coral Gables Estate',
    date: 'November 2023',
  },
];

// Scattered decorative dots (position / size / color / float speed)
const dots = [
  { top: '14%', left: '7%', size: 14, color: '#ff8a5a', dur: 4 },
  { top: '24%', left: '15%', size: 8, color: '#2dd4bf', dur: 5 },
  { top: '16%', right: '11%', size: 16, color: 'var(--color-primary)', dur: 4.5 },
  { top: '30%', right: '6%', size: 10, color: '#fbbf24', dur: 6 },
  { top: '48%', left: '3%', size: 9, color: '#fbbf24', dur: 5.5 },
  { top: '44%', right: '3%', size: 12, color: 'var(--color-primary)', dur: 4 },
  { bottom: '22%', left: '10%', size: 12, color: 'var(--color-primary)', dur: 5 },
  { bottom: '14%', left: '20%', size: 8, color: '#fbbf24', dur: 4.2 },
  { bottom: '26%', right: '13%', size: 14, color: '#2dd4bf', dur: 6 },
  { bottom: '16%', right: '8%', size: 10, color: '#ff8a5a', dur: 4.8 },
];

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff4f7b&color=fff&size=200&bold=true`;

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const total = testimonials.length;
  const next = () => {
    setDirection(1);
    setCurrentIndex((p) => (p + 1) % total);
  };
  const prev = () => {
    setDirection(-1);
    setCurrentIndex((p) => (p - 1 + total) % total);
  };

  const current = testimonials[currentIndex];
  const prevItem = testimonials[(currentIndex - 1 + total) % total];
  const nextItem = testimonials[(currentIndex + 1) % total];

  const variants = {
    enter: (dir) => ({ opacity: 0, scale: 0.9, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, scale: 0.9, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <section className="relative overflow-hidden py-16">
      {/* Soft gradient wash */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        }}
      />

      {/* Floating decorative dots */}
      {dots.map((d, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
          }}
        />
      ))}

      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
        >
          <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
            Our Customer Review
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
            We're recognized for exceeding guest expectations and delivering
            unforgettable Miami stays through care and detail.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mx-auto max-w-3xl">
          {/* Left preview avatar (prev) */}
          <motion.button
            type="button"
            onClick={prev}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.08, y: 0 }}
            className="absolute left-0 top-[38%] z-10 hidden -translate-y-1/2 lg:block"
            aria-label={`Previous: ${prevItem.name}`}
          >
            <div className="rounded-full bg-amber-100 p-2 shadow-lg">
              <img
                src={prevItem.avatar}
                onError={(e) => (e.currentTarget.src = fallbackAvatar(prevItem.name))}
                alt={prevItem.name}
                className="h-14 w-14 rounded-full object-cover opacity-90 xl:h-16 xl:w-16"
              />
            </div>
          </motion.button>

          {/* Right preview avatar (next) */}
          <motion.button
            type="button"
            onClick={next}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            whileHover={{ scale: 1.08, y: 0 }}
            className="absolute right-0 top-[38%] z-10 hidden -translate-y-1/2 lg:block"
            aria-label={`Next: ${nextItem.name}`}
          >
            <div className="rounded-full bg-[var(--color-primary)]/12 p-2 shadow-lg">
              <img
                src={nextItem.avatar}
                onError={(e) => (e.currentTarget.src = fallbackAvatar(nextItem.name))}
                alt={nextItem.name}
                className="h-14 w-14 rounded-full object-cover opacity-90 xl:h-16 xl:w-16"
              />
            </div>
          </motion.button>

          {/* Center content */}
          <div className="px-2 text-center lg:px-32">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                {/* Main avatar with ring */}
                <div className="relative mx-auto mb-5 w-fit">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-full bg-white p-1.5 shadow-[0_12px_40px_rgba(255,79,123,0.28)] ring-[3px] ring-[var(--color-primary)]"
                  >
                    <img
                      src={current.avatar}
                      onError={(e) => (e.currentTarget.src = fallbackAvatar(current.name))}
                      alt={current.name}
                      className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                    />
                  </motion.div>
                  {/* small accent dot */}
                  <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-[var(--color-primary)]" />
                </div>

                {/* Name */}
                <h3 className="text-xl font-black text-[var(--color-secondary)] sm:text-2xl">
                  {current.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)] sm:text-sm">
                  {current.location} · {current.date}
                </p>

                {/* Stars */}
                <div className="mt-3 flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, ease: 'backOut' }}
                    >
                      <HiStar
                        className={`h-5 w-5 ${i < current.rating
                            ? 'text-[var(--color-primary)]'
                            : 'text-gray-200'
                          }`}
                      />
                    </motion.span>
                  ))}
                </div>

                {/* Quote */}
                <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
                  "{current.text}"
                </p>

                {/* Property tag */}
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Stayed at {current.property}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows + dots */}
          <div className="mt-8 flex items-center justify-center gap-5 sm:gap-8">
            <motion.button
              type="button"
              onClick={prev}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[var(--color-secondary)] shadow-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              aria-label="Previous testimonial"
            >
              <HiArrowLeft className="h-5 w-5" />
            </motion.button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentIndex ? '28px' : '10px',
                    backgroundColor:
                      i === currentIndex ? 'var(--color-primary)' : '#e5e7eb',
                  }}
                />
              ))}
            </div>

            <motion.button
              type="button"
              onClick={next}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[var(--color-secondary)] shadow-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              aria-label="Next testimonial"
            >
              <HiArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;