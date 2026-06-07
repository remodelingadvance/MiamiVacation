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
import backgroundImage from "../../assets/palm-sketch.png";

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
    <section className="relative overflow-hidden bg-gray-50 py-12 sm:py-16 lg:py-20 xl:py-24">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        }}
      />

      {/* Soft Overlay */}
      <div className="absolute inset-0 z-0 bg-white/10" />

      {/* Background Decorations */}
      <div className="absolute -left-32 top-14 z-0 h-64 w-64 rounded-full bg-[var(--color-primary-light)] opacity-70 blur-3xl sm:-left-40 sm:h-80 sm:w-80" />
      <div className="absolute -right-32 bottom-10 z-0 h-64 w-64 rounded-full bg-pink-100/70 blur-3xl sm:-right-40 sm:h-80 sm:w-80" />

      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
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

            <h2 className="mt-4 text-2xl font-black leading-[1.15] text-gray-950 sm:mt-6 sm:text-3xl lg:text-4xl xl:text-5xl">
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

        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="h-36 w-36 animate-pulse rounded-full bg-gray-200 shadow-md sm:h-44 sm:w-44 lg:h-52 lg:w-52" />
                <div className="-mt-7 h-12 w-32 animate-pulse rounded-xl bg-white shadow-md" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden grid-cols-5 items-start gap-5 lg:grid xl:gap-7">
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
                    <div className="relative h-52 w-52 overflow-hidden rounded-full shadow-[0_22px_55px_rgba(0,0,0,0.14)] transition-all duration-300 group-hover:shadow-xl xl:h-60 xl:w-60">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="-mt-8 relative z-10 w-[82%] rounded-2xl bg-white px-4 py-3 shadow-[0_16px_38px_rgba(0,0,0,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                      <h3 className="text-base font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)] xl:text-lg">
                        {location.neighborhood}
                      </h3>
                    </div>
                  </Link>

                  <span className="absolute right-2 top-2 z-20 flex h-12 min-w-12 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-lg font-black text-white shadow-xl">
                    {location.count}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Tablet */}
            <div className="hidden grid-cols-2 gap-6 sm:grid md:grid-cols-3 lg:hidden">
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
                    <div className="relative h-44 w-44 overflow-hidden rounded-full shadow-lg sm:h-48 sm:w-48">
                      <img
                        src={location.image}
                        alt={`${location.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="-mt-7 relative z-10 w-[80%] rounded-xl bg-white px-3 py-2.5 shadow-md">
                      <h3 className="text-sm font-black text-gray-950 transition-colors group-hover:text-[var(--color-primary)]">
                        {location.neighborhood}
                      </h3>

                      <p className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-gray-400">
                        <HiLocationMarker className="h-3 w-3" />
                        Explore
                      </p>
                    </div>
                  </Link>

                  <span className="absolute right-4 top-2 z-20 flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-sm font-black text-white shadow-md">
                    {location.count}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Mobile Slider */}
            {activeLocation && (
              <div className="sm:hidden">
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
                    <div className="relative h-64 w-64 overflow-hidden rounded-full shadow-2xl">
                      <img
                        src={activeLocation.image}
                        alt={`${activeLocation.neighborhood} vacation rentals`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="-mt-9 relative z-10 w-[85%] rounded-2xl bg-white px-3 py-3 shadow-xl">
                      <h3 className="text-lg font-black leading-tight text-gray-950 transition-colors group-hover:text-[var(--color-primary)]">
                        {activeLocation.neighborhood}
                      </h3>

                      <div className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-[var(--color-primary)]">
                        <HiLocationMarker className="h-3.5 w-3.5" />
                        <span>View stays</span>
                        <HiArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <span className="absolute right-4 top-4 z-20 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-2.5 text-base font-black text-white shadow-xl">
                      {activeLocation.count}
                    </span>
                  </Link>
                </motion.div>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-[var(--color-primary)] hover:text-white"
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
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeSlide === index
                            ? "w-6 bg-[var(--color-primary)]"
                            : "w-1.5 bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to ${location.neighborhood}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition hover:bg-[var(--color-primary)] hover:text-white"
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
      </div>
    </section>
  );
};

export default PropertyLocationSection;