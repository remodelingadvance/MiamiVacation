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

const fallbackImages = [miamiBg, aboutBg, heroImage, ctaBg, buildingModel];

const getNeighborhoodUrl = (neighborhood) =>
  `/properties?${new URLSearchParams({ neighborhood }).toString()}`;

const PropertyLocationSection = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

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
      neighborhoods.map((location, index) => ({
        ...location,
        image: location.image || fallbackImages[index % fallbackImages.length],
      })),
    [neighborhoods]
  );

  const visibleLocations = locationCards.slice(0, 8);
  const activeLocation = visibleLocations[activeSlide];

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

  if (!loading && locationCards.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white py-12 sm:py-16 lg:py-20 xl:py-24">
      {/* Background Decorations */}
      <div className="absolute -left-32 top-14 h-64 w-64 rounded-full bg-[var(--color-primary-light)] opacity-60 blur-3xl sm:-left-40 sm:h-80 sm:w-80" />
      <div className="absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-pink-100/60 blur-3xl sm:-right-40 sm:h-80 sm:w-80" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-50/30 blur-3xl sm:h-96 sm:w-96" />

      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--color-primary)] sm:px-5 sm:py-2.5 sm:text-sm">
              <HiHome className="h-4 w-4 sm:h-5 sm:w-5" />
              Prime Locations
            </span>

            <h2 className="mt-4 text-3xl font-black leading-[1.15] text-gray-950 sm:mt-6 sm:text-4xl lg:text-5xl xl:text-6xl">
              Properties Across{" "}
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-pink-500 bg-clip-text text-transparent">
                All Locations
              </span>
            </h2>

            <p className="mx-auto mt-3 max-w-2xl px-4 text-sm font-medium leading-relaxed text-gray-500 sm:mt-4 sm:text-base lg:text-lg">
              Discover StayWise homes in the most desirable neighborhoods. Find
              the perfect stay for your next adventure.
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading ? (
          <>
            <div className="hidden grid-cols-2 gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-32 w-32 animate-pulse rounded-full bg-gray-200 shadow-md sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-52 lg:w-52 xl:h-56 xl:w-56" />
                  <div className="-mt-6 h-10 w-28 animate-pulse rounded-xl bg-gray-100 shadow-md sm:-mt-7 sm:h-12 sm:w-32 md:w-36 lg:w-40" />
                </div>
              ))}
            </div>
            <div className="flex justify-center sm:hidden">
              <div className="flex flex-col items-center">
                <div className="h-56 w-56 animate-pulse rounded-full bg-gray-200 shadow-md" />
                <div className="-mt-8 h-12 w-48 animate-pulse rounded-xl bg-gray-100 shadow-md" />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Grid (lg and up) - 5 columns */}
            <div className="hidden grid-cols-5 items-start gap-5 lg:grid xl:gap-6 2xl:gap-7">
              {visibleLocations.slice(0, 5).map((location, index) => (
                <motion.div
                  key={location.neighborhood}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min(index * 0.08, 0.35),
                    duration: 0.45,
                  }}
                  className="relative flex justify-center"
                >
                  <Link
                    to={getNeighborhoodUrl(location.neighborhood)}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <div className="relative h-44 w-44 overflow-hidden rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl lg:h-52 lg:w-52 xl:h-56 xl:w-56 2xl:h-60 2xl:w-60">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="-mt-7 relative z-10 w-[85%] rounded-xl bg-white px-2 py-2.5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl lg:-mt-8 lg:rounded-2xl lg:px-3 lg:py-3 xl:px-4 xl:py-3.5">
                      <h3 className="text-sm font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)] lg:text-base xl:text-lg">
                        {location.neighborhood}
                      </h3>
                    </div>
                  </Link>

                  {/* Count Badge - positioned relative to the card container */}
                  <div className="absolute right-0 top-0 z-20">
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-sm font-black text-white shadow-lg transition-transform group-hover:scale-105 lg:h-11 lg:min-w-11 lg:text-base xl:h-12 xl:min-w-12 xl:text-lg">
                      {location.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tablet Grid (md to lg) - 3 columns */}
            <div className="hidden grid-cols-2 gap-5 md:grid lg:hidden md:grid-cols-3">
              {visibleLocations.slice(0, 6).map((location, index) => (
                <motion.div
                  key={location.neighborhood}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min(index * 0.05, 0.3),
                    duration: 0.4,
                  }}
                  className="relative flex justify-center"
                >
                  <Link
                    to={getNeighborhoodUrl(location.neighborhood)}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl sm:h-48 sm:w-48 md:h-44 md:w-44">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="-mt-7 relative z-10 w-[80%] rounded-xl bg-white px-2 py-2 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:-mt-8 sm:py-2.5">
                      <h3 className="text-xs font-black text-gray-950 transition-colors group-hover:text-[var(--color-primary)] sm:text-sm md:text-base">
                        {location.neighborhood}
                      </h3>
                      <p className="mt-0.5 hidden items-center justify-center gap-1 text-xs font-medium text-gray-400 sm:flex">
                        <HiLocationMarker className="h-3 w-3" />
                        Explore
                      </p>
                    </div>
                  </Link>

                  {/* Count Badge */}
                  <div className="absolute right-1 top-1 z-20 sm:right-2 sm:top-2">
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-xs font-black text-white shadow-md sm:h-9 sm:min-w-9 sm:px-2 sm:text-sm">
                      {location.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Small Tablet (sm to md) - 2 columns */}
            <div className="hidden grid-cols-2 gap-4 sm:grid md:hidden">
              {visibleLocations.slice(0, 4).map((location, index) => (
                <motion.div
                  key={location.neighborhood}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min(index * 0.05, 0.3),
                    duration: 0.4,
                  }}
                  className="relative flex justify-center"
                >
                  <Link
                    to={getNeighborhoodUrl(location.neighborhood)}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <div className="relative h-36 w-36 overflow-hidden rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl sm:h-44 sm:w-44">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="-mt-6 relative z-10 w-[85%] rounded-xl bg-white px-2 py-1.5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:-mt-7 sm:py-2">
                      <h3 className="text-xs font-black text-gray-950 transition-colors group-hover:text-[var(--color-primary)] sm:text-sm">
                        {location.neighborhood.length > 12
                          ? location.neighborhood.slice(0, 10) + "..."
                          : location.neighborhood}
                      </h3>
                    </div>
                  </Link>

                  {/* Count Badge */}
                  <div className="absolute right-0 top-0 z-20 sm:right-1 sm:top-1">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-xs font-black text-white shadow-md sm:h-8 sm:min-w-8">
                      {location.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Slider View (below sm) */}
            {activeLocation && (
              <div className="relative sm:hidden">
                <motion.div
                  key={activeLocation.neighborhood}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex justify-center px-2"
                >
                  <Link
                    to={getNeighborhoodUrl(activeLocation.neighborhood)}
                    className="group relative flex w-full max-w-xs flex-col items-center text-center"
                  >
                    <div className="relative h-64 w-64 overflow-hidden rounded-full shadow-2xl transition-all duration-300 group-hover:shadow-xl">
                      <img
                        src={activeLocation.image}
                        alt={`${activeLocation.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>

                    <div className="-mt-9 relative z-10 w-[85%] rounded-2xl bg-white px-3 py-3 shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <h3 className="text-lg font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)]">
                        {activeLocation.neighborhood}
                      </h3>
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-[var(--color-primary)]">
                        <HiLocationMarker className="h-3.5 w-3.5" />
                        <span>View stays</span>
                        <HiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Count Badge for Mobile Slider - positioned absolutely on the image */}
                    <div className="absolute right-4 top-4 z-20">
                      <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-2.5 text-base font-black text-white shadow-xl">
                        {activeLocation.count}
                      </span>
                    </div>
                  </Link>
                </motion.div>

                {/* Slider Controls */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-all active:scale-95 hover:bg-[var(--color-primary)] hover:text-white"
                    aria-label="Previous location"
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex gap-1.5">
                    {visibleLocations.map((location, index) => (
                      <button
                        key={location.neighborhood}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`rounded-full transition-all duration-300 ${
                          activeSlide === index
                            ? "w-6 bg-[var(--color-primary)]"
                            : "w-1.5 bg-gray-300 hover:bg-gray-400"
                        } h-1.5`}
                        aria-label={`Go to ${location.neighborhood}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-all active:scale-95 hover:bg-[var(--color-primary)] hover:text-white"
                    aria-label="Next location"
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-3 text-center text-xs font-medium text-gray-400">
                  {activeSlide + 1} of {visibleLocations.length}
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA Button */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-10 flex justify-center sm:mt-12 lg:mt-14 xl:mt-16"
        >
          <Link
            to="/properties"
            className="group relative inline-flex min-h-[42px] items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:min-h-[44px] sm:px-6 sm:py-3 sm:text-sm md:px-7 md:text-base"
          >
            <span className="absolute inset-y-0 left-0 w-0 bg-gray-950 transition-all duration-500 ease-out group-hover:w-full" />
            <span className="relative z-10 flex items-center gap-2">
              Browse All Properties
              <HiArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
            </span>
          </Link>
        </motion.div> */}
      </div>
    </section>
  );
};

export default PropertyLocationSection;