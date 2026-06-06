import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiHome,
  HiLocationMarker,
} from "react-icons/hi";
import apiService from "../../config/api";
import aboutBg from "../../assets/aboutBg.png";
import buildingModel from "../../assets/buildingModel.png";
import ctaBg from "../../assets/ctabg.png";
import heroImage from "../../assets/hero.png";
import miamiBg from "../../assets/miamiBg.png";

const FALLBACK_IMAGES = [miamiBg, aboutBg, heroImage, ctaBg, buildingModel];

const encodeNeighborhoodLink = (neighborhood) =>
  `/properties?${new URLSearchParams({ neighborhood }).toString()}`;

const PropertyLocationSection = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPropertyNeighborhoods();
        setNeighborhoods(response.data.neighborhoods || []);
      } catch (error) {
        console.error("Failed to load property neighborhoods:", error);
        setNeighborhoods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  const locationCards = useMemo(
    () =>
      neighborhoods.map((item, index) => ({
        ...item,
        image: item.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      })),
    [neighborhoods]
  );

  // Responsive visible count based on screen size
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 8;
    if (window.innerWidth >= 1280) return 8; // 2xl
    if (window.innerWidth >= 1024) return 6; // lg
    if (window.innerWidth >= 768) return 4; // md
    return 1; // mobile
  };

  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      const newCount = getVisibleCount();
      setVisibleCount(newCount);
      // Reset active slide if it exceeds new visible locations length
      if (activeSlide >= newCount && newCount > 0) {
        setActiveSlide(0);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSlide]);

  const visibleLocations = locationCards.slice(0, visibleCount);
  const activeLocation = visibleLocations[activeSlide];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const prevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? visibleLocations.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((prev) =>
      prev === visibleLocations.length - 1 ? 0 : prev + 1
    );
  };

  if (!loading && visibleLocations.length === 0) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white py-12 sm:py-16 lg:py-20 xl:py-24">
      {/* Background Decorations */}
      <div className="absolute -left-40 top-16 h-64 w-64 rounded-full bg-[var(--color-primary-light)] blur-3xl opacity-60" />
      <div className="absolute -right-40 bottom-10 h-64 w-64 rounded-full bg-pink-100/60 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-50/30 blur-3xl" />

      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--color-primary)] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <HiHome className="h-4 w-4 sm:h-5 sm:w-5" />
            Prime Locations
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="mt-4 text-2xl font-black leading-[1.15] text-gray-950 sm:mt-6 sm:text-3xl lg:text-4xl xl:text-5xl"
          >
            Properties Across{" "}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-pink-500 bg-clip-text text-transparent">
              All Locations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14, duration: 0.45 }}
            className="mx-auto mt-3 max-w-2xl px-4 text-sm font-medium leading-relaxed text-gray-500 sm:mt-4 sm:text-base lg:text-lg"
          >
            Discover StayWise homes in the most desirable neighborhoods. Find the
            perfect stay for your next adventure.
          </motion.p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {/* Desktop Skeleton */}
            <div className="hidden grid-cols-2 gap-5 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200 shadow-md sm:h-48 sm:w-48 md:h-52 md:w-52 lg:h-56 lg:w-56" />
                  <div className="-mt-8 h-14 w-40 animate-pulse rounded-xl bg-gray-100 shadow-md sm:w-44" />
                </div>
              ))}
            </div>

            {/* Mobile Skeleton */}
            <div className="flex justify-center md:hidden">
              <div className="flex flex-col items-center">
                <div className="h-64 w-64 animate-pulse rounded-full bg-gray-200 shadow-md sm:h-72 sm:w-72" />
                <div className="-mt-9 h-14 w-52 animate-pulse rounded-xl bg-gray-100 shadow-md" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Grid View (xl screens) */}
            <div className="hidden xl:grid xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-7">
              {visibleLocations.map((location, index) => (
                <motion.div
                  key={location.neighborhood}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  custom={index}
                  className="flex justify-center"
                >
                  <Link
                    to={encodeNeighborhoodLink(location.neighborhood)}
                    className="group relative flex w-full flex-col items-center text-center"
                  >
                    {/* Image Circle */}
                    <div className="relative h-48 w-48 overflow-hidden rounded-full shadow-xl transition-all duration-300 group-hover:shadow-2xl lg:h-52 lg:w-52 xl:h-56 xl:w-56">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Count Badge */}
                    <span className="absolute right-2 top-2 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-2.5 text-sm font-black text-white shadow-lg transition-transform group-hover:scale-105 lg:right-3 lg:top-3 lg:h-12 lg:min-w-12 lg:text-base">
                      {location.count}
                    </span>

                    {/* Label Card */}
                    <div className="-mt-8 relative z-10 w-[85%] rounded-xl bg-white px-3 py-3 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl lg:rounded-2xl lg:px-4 lg:py-3.5">
                      <h3 className="text-base font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)] lg:text-lg">
                        {location.neighborhood}
                      </h3>
                      <p className="mt-0.5 hidden items-center justify-center gap-1 text-xs font-medium text-gray-400 group-hover:flex lg:flex">
                        <HiLocationMarker className="h-3 w-3" />
                        View properties
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Tablet Grid View (md to xl) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:hidden gap-5 lg:gap-6">
              {visibleLocations.map((location, index) => (
                <motion.div
                  key={location.neighborhood}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
                  className="flex justify-center"
                >
                  <Link
                    to={encodeNeighborhoodLink(location.neighborhood)}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <div className="relative h-44 w-44 overflow-hidden rounded-full shadow-lg transition-all group-hover:shadow-xl sm:h-52 sm:w-52 md:h-56 md:w-56">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <span className="absolute right-4 top-4 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-2.5 text-sm font-black text-white shadow-md">
                      {location.count}
                    </span>

                    <div className="-mt-7 relative z-10 w-[80%] rounded-xl bg-white px-3 py-2.5 shadow-md transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
                      <h3 className="text-base font-black text-gray-950 transition-colors group-hover:text-[var(--color-primary)] sm:text-lg">
                        {location.neighborhood}
                      </h3>
                      <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-medium text-gray-400">
                        <HiLocationMarker className="h-3 w-3" />
                        Explore
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Slider View */}
            {activeLocation && (
              <div
                className="md:hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  key={activeLocation.neighborhood}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex justify-center px-2"
                >
                  <Link
                    to={encodeNeighborhoodLink(activeLocation.neighborhood)}
                    className="group flex w-full max-w-xs flex-col items-center text-center"
                  >
                    {/* Large Circle Image for Mobile */}
                    <div className="relative h-64 w-64 overflow-hidden rounded-full shadow-2xl transition-all duration-300 group-hover:shadow-xl sm:h-72 sm:w-72">
                      <img
                        src={activeLocation.image}
                        alt={`${activeLocation.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>

                    {/* Count Badge */}
                    <span className="absolute right-8 top-8 flex h-12 min-w-12 items-center justify-center rounded-full bg-[var(--color-primary)] px-3 text-base font-black text-white shadow-xl sm:right-10 sm:top-10">
                      {activeLocation.count}
                    </span>

                    {/* Info Card */}
                    <div className="-mt-10 relative z-10 w-[85%] rounded-2xl bg-white px-4 py-4 shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <h3 className="text-xl font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)]">
                        {activeLocation.neighborhood}
                      </h3>

                      <div className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-[var(--color-primary)]">
                        <HiLocationMarker className="h-4 w-4" />
                        <span>View available stays</span>
                        <HiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Slider Controls */}
                <div className="mt-8 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-all active:scale-95 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--color-primary)]/30"
                    aria-label="Previous location"
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Pagination Dots */}
                  <div className="flex gap-2">
                    {visibleLocations.map((location, index) => (
                      <button
                        key={location.neighborhood}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`rounded-full transition-all duration-300 ${
                          activeSlide === index
                            ? "w-7 bg-[var(--color-primary)]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                        } h-2`}
                        aria-label={`Go to ${location.neighborhood}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-all active:scale-95 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--color-primary)]/30"
                    aria-label="Next location"
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Slide Counter */}
                <p className="mt-4 text-center text-xs font-medium text-gray-400">
                  {activeSlide + 1} of {visibleLocations.length} neighborhoods
                </p>
              </div>
            )}

            {/* Extra small devices message */}
            {visibleLocations.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No neighborhoods available at the moment.</p>
              </div>
            )}
          </>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-12 flex justify-center sm:mt-14 lg:mt-16"
        >
          {/* <Link
            to="/properties"
            className="group relative inline-flex min-h-[44px] items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-3.5 sm:text-base"
          >
            <span className="absolute inset-y-0 left-0 w-0 bg-gray-950 transition-all duration-500 ease-out group-hover:w-full" />
            <span className="relative z-10 flex items-center gap-2">
              Browse All Properties
              <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
            </span>
          </Link> */}
        </motion.div>
      </div>
    </section>
  );
};

export default PropertyLocationSection;