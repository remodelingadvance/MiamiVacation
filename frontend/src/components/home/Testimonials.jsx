import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FaQuoteLeft } from "react-icons/fa";

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
    text: 'Our family vacation was magical thanks to Miami Luxury Rentals. The villa had everything we needed, and the private pool was a hit with the kids. Truly a home away from home.',
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
    text: 'Best booking experience ever! The team was incredibly responsive, and the property was even better than the photos. Can\'t wait to come back next winter!',
    property: 'Coral Gables Estate',
    date: 'November 2023',
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-[var(--color-bg-medium)]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white">
            What Our Guests Say
          </h2>
          <p className="section-subtitle mx-auto">
            Read reviews from guests who have experienced Miami luxury with us
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Quote icon */}
          <div className="absolute -top-6 -left-4 text-[var(--color-primary)]/20">
            <FaQuoteLeft className="w-16 h-16" />
          </div>

          {/* Testimonial card */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="glass rounded-2xl p-8 md:p-12 text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-6 h-6 ${
                        i < currentTestimonial.rating
                          ? 'text-[var(--color-primary)]'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 font-display italic">
                  "{currentTestimonial.text}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">{currentTestimonial.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {currentTestimonial.location} • {currentTestimonial.date}
                    </p>
                  </div>
                </div>

                {/* Property */}
                <p className="mt-4 text-sm text-[var(--color-primary)]">
                  Stayed at: {currentTestimonial.property}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full glass-light flex items-center justify-center text-white hover:text-[var(--color-primary)] hover:bg-white/10 transition-all"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-[var(--color-primary)] w-8'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full glass-light flex items-center justify-center text-white hover:text-[var(--color-primary)] hover:bg-white/10 transition-all"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {[
            { value: '4.9', label: 'Average Rating' },
            { value: '98%', label: 'Guest Satisfaction' },
            { value: '1,000+', label: '5-Star Reviews' },
            { value: '24/7', label: 'Guest Support' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;