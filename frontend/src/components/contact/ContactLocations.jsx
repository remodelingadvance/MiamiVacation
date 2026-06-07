import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    HiArrowRight,
    HiLocationMarker,
    HiHome,
    HiChevronLeft,
    HiChevronRight,
    HiStar,
} from "react-icons/hi";
import { FaMapMarkerAlt } from "react-icons/fa";
import apiService from "../../config/api";
import miamiBg from "../../assets/miamiBg.png";
import aboutBg from "../../assets/aboutBg.png";
import heroImage from "../../assets/hero.png";
import ctaBg from "../../assets/ctabg.png";
import buildingModel from "../../assets/buildingModel.png";
import backgroundImage from "../../assets/contact-property-bg.png";

const fallbackImages = [miamiBg, aboutBg, heroImage, ctaBg, buildingModel];

const EASE = [0.22, 1, 0.36, 1];

const getNeighborhoodUrl = (neighborhood) =>
    `/properties?${new URLSearchParams({ neighborhood }).toString()}`;

const ContactLocations = () => {
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            try {
                setLoading(true);
                const response = await apiService.getPropertyNeighborhoods();
                setNeighborhoods(response.data.neighborhoods || []);
            } catch (error) {
                console.error("Failed to load neighborhoods:", error);
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
    const activeLocation = visibleLocations[activeIndex];

    if (!loading && locationCards.length === 0) return null;

    const prev = () =>
        setActiveIndex((p) => (p === 0 ? visibleLocations.length - 1 : p - 1));
    const next = () =>
        setActiveIndex((p) => (p === visibleLocations.length - 1 ? 0 : p + 1));

    return (
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                    backgroundAttachment: "fixed",
                }}
            />
            {/* Decorative bg */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#e8527a]/8 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 grid grid-cols-1 items-end gap-6 lg:mb-14 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8527a]/20 bg-[#e8527a]/5 px-4 py-1.5 backdrop-blur-sm">
                            <motion.span
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-1.5 w-1.5 rounded-full bg-[#e8527a]"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8527a]">
                                Explore Areas
                            </span>
                        </span>

                        <h2
                            className="text-3xl font-black leading-tight text-[#0d3347] sm:text-4xl lg:text-5xl"
                            style={{ fontFamily: "var(--font-display, serif)" }}
                        >
                            Find StayWise in{" "}
                            <span className="bg-gradient-to-r from-[#e8527a] to-[#ff7a9c] bg-clip-text text-transparent">
                                Top Neighborhoods
                            </span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="max-w-md text-sm leading-relaxed text-gray-500 sm:text-[15px] lg:justify-self-end"
                    >
                        Our concierge team manages properties across Miami's most sought-after
                        neighborhoods. Tap a card to view available stays.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-200" />
                                <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ═══ DESKTOP: Bento grid layout ═══ */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-4 gap-5">
                                {/* Featured large card */}
                                {visibleLocations[0] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, ease: EASE }}
                                        className="col-span-2 row-span-2"
                                    >
                                        <FeaturedCard
                                            location={visibleLocations[0]}
                                            large
                                            isHovered={hoveredIndex === 0}
                                            onHover={() => setHoveredIndex(0)}
                                            onLeave={() => setHoveredIndex(null)}
                                        />
                                    </motion.div>
                                )}

                                {/* Smaller cards */}
                                {visibleLocations.slice(1, 5).map((location, i) => (
                                    <motion.div
                                        key={location.neighborhood}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.1 + i * 0.08,
                                            ease: EASE,
                                        }}
                                    >
                                        <CompactCard
                                            location={location}
                                            isHovered={hoveredIndex === i + 1}
                                            onHover={() => setHoveredIndex(i + 1)}
                                            onLeave={() => setHoveredIndex(null)}
                                        />
                                    </motion.div>
                                ))}

                                {/* Wide bottom card */}
                                {visibleLocations[5] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="col-span-2"
                                    >
                                        <WideCard location={visibleLocations[5]} />
                                    </motion.div>
                                )}

                                {/* Last 2 small cards */}
                                {visibleLocations.slice(6, 8).map((location, i) => (
                                    <motion.div
                                        key={location.neighborhood}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.55 + i * 0.08 }}
                                    >
                                        <CompactCard
                                            location={location}
                                            isHovered={hoveredIndex === i + 6}
                                            onHover={() => setHoveredIndex(i + 6)}
                                            onLeave={() => setHoveredIndex(null)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* ═══ TABLET: 2-3 col grid ═══ */}
                        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:hidden">
                            {visibleLocations.slice(0, 6).map((location, i) => (
                                <motion.div
                                    key={location.neighborhood}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                >
                                    <CompactCard
                                        location={location}
                                        isHovered={hoveredIndex === i}
                                        onHover={() => setHoveredIndex(i)}
                                        onLeave={() => setHoveredIndex(null)}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* ═══ MOBILE: Slider ═══ */}
                        <div className="sm:hidden">
                            {activeLocation && (
                                <div className="relative px-2">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeLocation.neighborhood}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Link
                                                to={getNeighborhoodUrl(activeLocation.neighborhood)}
                                                className="group block overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 active:scale-[0.98]"
                                            >
                                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                    <img
                                                        src={activeLocation.image}
                                                        alt={activeLocation.neighborhood}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#e8527a] shadow-md backdrop-blur-md">
                                                        <FaMapMarkerAlt className="h-2.5 w-2.5" />
                                                        Miami
                                                    </div>

                                                    <div className="absolute right-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-full bg-[#e8527a] px-2.5 text-sm font-black text-white shadow-lg">
                                                        {activeLocation.count}
                                                    </div>

                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <h3 className="text-xl font-black text-white drop-shadow-lg">
                                                            {activeLocation.neighborhood}
                                                        </h3>
                                                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#0d3347]">
                                                            <HiLocationMarker className="h-3 w-3 text-[#e8527a]" />
                                                            View stays
                                                            <HiArrowRight className="h-3 w-3 text-[#e8527a]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Slider controls */}
                                    <div className="mt-5 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={prev}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all active:scale-90 hover:border-[#e8527a]/30 hover:bg-[#e8527a] hover:text-white"
                                            aria-label="Previous"
                                        >
                                            <HiChevronLeft className="h-5 w-5" />
                                        </button>

                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex gap-1.5">
                                                {visibleLocations.map((loc, i) => (
                                                    <button
                                                        key={loc.neighborhood}
                                                        type="button"
                                                        onClick={() => setActiveIndex(i)}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i
                                                                ? "w-8 bg-[#e8527a]"
                                                                : "w-1.5 bg-gray-300"
                                                            }`}
                                                        aria-label={`Go to ${loc.neighborhood}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[10px] font-semibold text-gray-400">
                                                {activeIndex + 1} / {visibleLocations.length}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={next}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all active:scale-90 hover:border-[#e8527a]/30 hover:bg-[#e8527a] hover:text-white"
                                            aria-label="Next"
                                        >
                                            <HiChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* View all CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-4"
                        >
                            <p className="text-xs font-medium text-gray-500 sm:text-sm">
                                Want to see all our Miami properties?
                            </p>
                            <Link
                                to="/properties"
                                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8527a] to-[#d4405f] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#e8527a]/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-[#e8527a]/40 sm:text-sm"
                            >
                                View All Properties
                                <HiArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
};

/* ═══════════════ CARD COMPONENTS ═══════════════ */

const FeaturedCard = ({ location, large, isHovered, onHover, onLeave }) => {
    return (
        <Link
            to={getNeighborhoodUrl(location.neighborhood)}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="group relative block h-full overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl"
            style={{ minHeight: large ? 520 : 360 }}
        >
            <motion.img
                src={location.image}
                alt={location.neighborhood}
                animate={{ scale: isHovered ? 1.08 : 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full w-full object-cover"
                loading="lazy"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Top-left badge */}
            <div className="absolute left-4 top-4 flex flex-col gap-2 sm:left-5 sm:top-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#e8527a] shadow-md backdrop-blur-md">
                    <FaMapMarkerAlt className="h-2.5 w-2.5" />
                    Miami
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-md backdrop-blur-md">
                    <HiStar className="h-3 w-3" />
                    Featured
                </div>
            </div>

            {/* Count badge */}
            <div className="absolute right-4 top-4 flex h-12 min-w-12 items-center justify-center rounded-full bg-[#e8527a] px-3 text-base font-black text-white shadow-xl sm:right-5 sm:top-5">
                {location.count}
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3
                    className="text-2xl font-black text-white drop-shadow-lg sm:text-3xl lg:text-4xl"
                    style={{ fontFamily: "var(--font-display, serif)" }}
                >
                    {location.neighborhood}
                </h3>
                <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs font-semibold text-white/80 sm:text-sm">
                        {location.count} properties
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/60" />
                    <span className="text-xs font-semibold text-white/80 sm:text-sm">
                        Verified stays
                    </span>
                </div>

                <motion.div
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                    }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#e8527a] shadow-lg"
                >
                    Explore Stays
                    <HiArrowRight className="h-3.5 w-3.5" />
                </motion.div>
            </div>
        </Link>
    );
};

const CompactCard = ({ location, isHovered, onHover, onLeave }) => {
    return (
        <Link
            to={getNeighborhoodUrl(location.neighborhood)}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="group relative block overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl"
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                <motion.img
                    src={location.image}
                    alt={location.neighborhood}
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/75" />

                <div className="absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#e8527a] px-2 text-xs font-black text-white shadow-md">
                    {location.count}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3
                        className="text-lg font-black text-white drop-shadow-md sm:text-xl"
                        style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                        {location.neighborhood}
                    </h3>

                    <motion.div
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            y: isHovered ? 0 : -5,
                        }}
                        transition={{ duration: 0.2 }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/90"
                    >
                        Explore
                        <HiArrowRight className="h-3 w-3" />
                    </motion.div>
                </div>
            </div>
        </Link>
    );
};

const WideCard = ({ location }) => {
    return (
        <Link
            to={getNeighborhoodUrl(location.neighborhood)}
            className="group relative block overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl"
        >
            <div className="relative aspect-[2/1] w-full overflow-hidden">
                <img
                    src={location.image}
                    alt={location.neighborhood}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#e8527a] shadow-md backdrop-blur-md">
                    <FaMapMarkerAlt className="h-2.5 w-2.5" />
                    Trending
                </div>

                <div className="absolute right-4 top-4 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#e8527a] px-2 text-xs font-black text-white shadow-md">
                    {location.count}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3
                        className="text-xl font-black text-white drop-shadow-md"
                        style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                        {location.neighborhood}
                    </h3>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                        View Properties
                        <HiArrowRight className="h-3 w-3" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ContactLocations;