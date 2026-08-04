import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiCalendar,
  HiChevronDown,
  HiLocationMarker,
  HiSearch,
  HiUsers,
} from "react-icons/hi";
import { format, isValid, parseISO } from "date-fns";
import { THEME } from "../../config/theme.config";
import MiamiVideo from "../../assets/miami.mp4";

const HERO_IMAGE = '/images/stay-wise-hero.png';

const DateRange = lazy(() =>
  import("react-date-range").then((module) => ({ default: module.DateRange }))
);

const CalendarFallback = () => (
  <div className="flex h-[360px] w-full items-center justify-center bg-white text-sm font-bold text-gray-500 sm:w-[360px]">
    Loading calendar...
  </div>
);
const getSafeDate = (date, fallback) => {
  if (date instanceof Date && isValid(date)) return date;

  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : fallback;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const pickerWrapperRef = useRef(null);

  const today = new Date();
  const defaultStart = getSafeDate(THEME.hero.defaultDateStart, today);
  const defaultEnd = getSafeDate(
    THEME.hero.defaultDateEnd,
    new Date(today.getTime() + 24 * 60 * 60 * 1000)
  );

  const [selectedLocation, setSelectedLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestDrop, setShowGuestDrop] = useState(false);
  const [guests, setGuests] = useState(2);
  const [heroVideoEnabled, setHeroVideoEnabled] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStart,
      endDate: defaultEnd,
      key: "selection",
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerWrapperRef.current &&
        !pickerWrapperRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
        setShowGuestDrop(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const savesData = navigator.connection?.saveData;

    if (prefersReducedMotion || savesData) return undefined;

    let timeoutId;
    let idleId;

    const enableVideo = () => setHeroVideoEnabled(true);

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableVideo, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(enableVideo, 650);
    }

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const startDate = dateRange[0]?.startDate || today;
  const endDate = dateRange[0]?.endDate || startDate;

  const formattedRange = `${format(startDate, "MMM d")} - ${format(
    endDate,
    "MMM d, yyyy"
  )}`;

  const handleDateChange = (item) => {
    const selection = item.selection;

    setDateRange([
      {
        startDate: selection.startDate || startDate,
        endDate: selection.endDate || selection.startDate || endDate,
        key: "selection",
      },
    ]);
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn: format(startDate, "yyyy-MM-dd"),
      checkOut: format(endDate, "yyyy-MM-dd"),
      guests: guests.toString(),
    });

    if (selectedLocation) params.set("search", selectedLocation);

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={HERO_IMAGE}
        alt="Luxury Miami vacation rental overlooking the bay"
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          heroVideoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {heroVideoEnabled && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_IMAGE}
          onCanPlay={() => setHeroVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            heroVideoReady ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <source src={MiamiVideo} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-white drop-shadow-md sm:text-base">
              Welcome to StayWise
            </p>

            <h1 className="mx-auto max-w-5xl font-hero text-5xl font-black uppercase leading-none text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
              Find Your Perfect Stay
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-white/95 drop-shadow-md sm:text-lg">
              Discover beautiful stays, compare comfort, and book your next trip
              wisely.
            </p>
          </motion.div>

          <motion.div
            ref={pickerWrapperRef}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25, ease: "easeOut" }}
            className="relative z-20 mx-auto mt-10 w-full max-w-5xl rounded-3xl bg-white/95 p-4 text-left shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-white/40 backdrop-blur-sm sm:p-5"
          >
            <div className="grid gap-3 lg:grid-cols-[1.3fr_1.4fr_1fr_auto]">
              <div className="flex min-h-[66px] items-center gap-3 rounded-2xl bg-[var(--color-primary-light)] px-4 transition hover:bg-white hover:shadow-md">
                <HiLocationMarker className="h-6 w-6 shrink-0 text-[var(--color-primary)]" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Location
                  </p>

                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none bg-transparent pr-7 text-sm font-semibold text-gray-900 outline-none sm:text-base"
                    >
                      {THEME.locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>

                    <HiChevronDown className="pointer-events-none absolute right-0 top-1 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker((prev) => !prev);
                    setShowGuestDrop(false);
                  }}
                  className="flex min-h-[66px] w-full items-center gap-3 rounded-2xl bg-[var(--color-primary-light)] px-4 text-left transition hover:bg-white hover:shadow-md"
                >
                  <HiCalendar className="h-6 w-6 shrink-0 text-[var(--color-primary)]" />

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase text-gray-500">
                      Check In - Check Out
                    </span>

                    <span className="block truncate text-sm font-semibold text-gray-900 sm:text-base">
                      {formattedRange}
                    </span>
                  </span>

                  <HiChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-1/2 top-28 z-[10000] w-[calc(100vw-24px)] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:absolute sm:left-0 sm:top-full sm:mt-3 sm:w-auto sm:max-w-none sm:translate-x-0"
                    >
                      <Suspense fallback={<CalendarFallback />}>
                        <DateRange
                          editableDateInputs
                          minDate={today}
                          moveRangeOnFirstSelection={false}
                          onChange={handleDateChange}
                          rangeColors={["#FF4F7B"]}
                          ranges={dateRange}
                        />
                      </Suspense>

                      <div className="flex justify-end border-t border-gray-100 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="rounded-xl bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)]"
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestDrop((prev) => !prev);
                    setShowDatePicker(false);
                  }}
                  className="flex min-h-[66px] w-full items-center gap-3 rounded-2xl bg-[var(--color-primary-light)] px-4 text-left transition hover:bg-white hover:shadow-md"
                >
                  <HiUsers className="h-6 w-6 shrink-0 text-[var(--color-primary)]" />

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase text-gray-500">
                      Guests
                    </span>

                    <span className="block text-sm font-semibold text-gray-900 sm:text-base">
                      {guests} {guests === 1 ? "Guest" : "Guests"}
                    </span>
                  </span>

                  <HiChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showGuestDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full z-[10000] mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl"
                    >
                      <p className="mb-4 text-xs font-bold uppercase text-gray-500">
                        Number of guests
                      </p>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setGuests((value) => Math.max(1, value - 1))
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl font-bold text-gray-800 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        >
                          -
                        </button>

                        <span className="text-2xl font-black text-gray-900">
                          {guests}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setGuests((value) => Math.min(20, value + 1))
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl font-bold text-gray-800 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGuestDrop(false)}
                        className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-2 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)]"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="group relative flex min-h-[66px] items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary)] px-7 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl sm:text-base"
              >
                <span className="absolute inset-y-0 left-0 w-0 bg-gray-950 transition-all duration-500 ease-out group-hover:w-full" />
                <span className="relative z-10 flex items-center gap-2">
                  <HiSearch className="h-5 w-5" />
                  Find Stays
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
