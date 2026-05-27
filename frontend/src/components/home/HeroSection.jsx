import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiArrowRight,
  HiCalendar,
  HiChevronDown,
  HiLocationMarker,
  HiOfficeBuilding,
  HiPhone,
  HiShieldCheck,
  HiTag,
  HiUsers,
} from 'react-icons/hi';
import { GiSoccerBall, GiTrophyCup } from 'react-icons/gi';
import { DateRange } from 'react-date-range';
import { format, parseISO } from 'date-fns';
import { THEME } from '../../config/theme.config';

const StatIcon = ({ iconKey, color }) => {
  const iconClass = 'h-8 w-8';
  const icons = {
    stadium: <HiOfficeBuilding className={iconClass} />,
    calendar: <HiCalendar className={iconClass} />,
    shield: <HiShieldCheck className={iconClass} />,
    ticket: <HiTag className={iconClass} />,
    headset: <HiPhone className={iconClass} />,
  };

  return (
    <span className="flex items-center justify-center" style={{ color }}>
      {icons[iconKey] ?? icons.shield}
    </span>
  );
};

const HeroVisual = () => (
  <div className="pointer-events-none absolute bottom-[128px] right-[-6vw] top-[-18px] z-0 hidden w-[58vw] max-w-[900px] lg:block">
    <div className="hero-ribbon hero-ribbon-pink" />
    <div className="hero-ribbon hero-ribbon-white" />
    <div className="hero-ribbon hero-ribbon-blue" />
    <div className="hero-ribbon hero-ribbon-sky" />
    <div className="hero-ribbon hero-ribbon-green" />
    <div className="hero-ribbon hero-ribbon-yellow" />

    <div className="absolute right-[10%] top-0 h-[76%] w-[76%]">
      <span className="hero-number-shadow">26</span>
      <span className="hero-number-main">26</span>
      <div className="hero-trophy">
        <GiTrophyCup aria-hidden="true" />
        <span>FIFA</span>
      </div>
    </div>

    <div className="hero-ball">
      <GiSoccerBall aria-hidden="true" />
    </div>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const datePickerRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestDrop, setShowGuestDrop] = useState(false);
  const [guests, setGuests] = useState(2);
  const [dateRange, setDateRange] = useState([
    {
      startDate: parseISO(THEME.hero.defaultDateStart),
      endDate: parseISO(THEME.hero.defaultDateEnd),
      key: 'selection',
    },
  ]);

  const formattedRange = `${format(dateRange[0].startDate, 'MMM d')} - ${format(
    dateRange[0].endDate,
    'MMM d, yyyy'
  )}`;

  const closePickers = () => {
    setShowDatePicker(false);
    setShowGuestDrop(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn: format(dateRange[0].startDate, 'yyyy-MM-dd'),
      checkOut: format(dateRange[0].endDate, 'yyyy-MM-dd'),
      guests: guests.toString(),
    });

    if (selectedLocation) params.set('search', selectedLocation);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="world-cup-hero relative isolate overflow-hidden bg-white lg:min-h-[970px]">
      <img
        src={THEME.hero.heroImage}
        alt="Miami beachfront vacation stays"
        className="absolute inset-0 h-full w-full object-cover object-center"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_28%,rgba(255,255,255,0.36)_58%,rgba(255,255,255,0.06)_100%)]" />
      {/* <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.16)_34%,rgba(255,255,255,0.9)_100%)]" /> */}

      <HeroVisual />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-[860px] pb-12 pt-28 sm:pt-36 lg:pb-[268px] lg:pt-[174px]"
        >
          <div className="mb-6 flex flex-wrap items-center gap-2 font-bold uppercase text-[15px] leading-none sm:text-xl">
            <span style={{ color: THEME.colors.textDark }}>
              {THEME.hero.badge.prefix}
            </span>
            <span style={{ color: THEME.colors.primary }}>
              {THEME.hero.badge.highlight}
            </span>
          </div>

          <h1
            className="font-hero text-[4.15rem] font-black uppercase leading-[0.86] sm:text-[5.8rem] lg:text-[7.15rem] 2xl:text-[7.65rem]"
            style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
          >
            {THEME.hero.heading.line1}
            <br />
            <span style={{ color: THEME.colors.primary }}>
              {THEME.hero.heading.line2Primary}
            </span>
            <span className="hero-heading-blue">
              {THEME.hero.heading.line2Secondary}
            </span>
          </h1>

          <p
            className="mt-7 max-w-[720px] text-lg font-medium leading-8 sm:text-[1.45rem] sm:leading-10"
            style={{ color: THEME.colors.textDark }}
          >
            {THEME.hero.subtext}
          </p>

          <div
            className="world-cup-search relative z-20 mt-8 w-full max-w-[830px] overflow-visible rounded-2xl bg-white shadow-[0_18px_44px_rgba(8,19,76,0.14)] ring-1 ring-black/5"
          >
            <div className="grid divide-y divide-gray-100 sm:grid-cols-[1.12fr_1.35fr_1fr_auto] sm:divide-x sm:divide-y-0">
              <div className="flex min-h-[88px] items-center gap-4 px-5 sm:px-6">
                <HiLocationMarker
                  className="h-8 w-8 shrink-0"
                  style={{ color: THEME.colors.primary }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold uppercase"
                    style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
                  >
                    Location
                  </p>
                  <div className="relative mt-1">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none bg-transparent pr-7 text-base font-medium leading-6 outline-none"
                      style={{ color: THEME.colors.textDark }}
                    >
                      {THEME.locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                    <HiChevronDown className="pointer-events-none absolute right-0 top-1 h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker((open) => !open);
                    setShowGuestDrop(false);
                  }}
                  className="flex min-h-[88px] w-full items-center gap-4 px-5 text-left transition-colors hover:bg-gray-50 sm:px-6"
                >
                  <HiCalendar
                    className="h-8 w-8 shrink-0"
                    style={{ color: THEME.colors.primary }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-xs font-bold uppercase"
                      style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
                    >
                      Check In - Out
                    </span>
                    <span
                      className="mt-1 block truncate text-base font-medium leading-6"
                      style={{ color: THEME.colors.textDark }}
                    >
                      {formattedRange}
                    </span>
                  </span>
                  <HiChevronDown className="h-4 w-4 shrink-0" />
                </button>

                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
                      style={{ minWidth: 330 }}
                    >
                      <DateRange
                        editableDateInputs
                        minDate={new Date()}
                        moveRangeOnFirstSelection={false}
                        onChange={(item) => setDateRange([item.selection])}
                        rangeColors={[THEME.colors.primary]}
                        ranges={dateRange}
                      />
                      <div className="flex justify-end border-t border-gray-100 bg-white px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="btn-primary px-5 py-2 text-xs"
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
                    setShowGuestDrop((open) => !open);
                    setShowDatePicker(false);
                  }}
                  className="flex min-h-[88px] w-full items-center gap-4 px-5 text-left transition-colors hover:bg-gray-50 sm:px-6"
                >
                  <HiUsers
                    className="h-8 w-8 shrink-0"
                    style={{ color: THEME.colors.primary }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-xs font-bold uppercase"
                      style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
                    >
                      Guests
                    </span>
                    <span
                      className="mt-1 block text-base font-medium leading-6"
                      style={{ color: THEME.colors.textDark }}
                    >
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </span>
                  <HiChevronDown className="h-4 w-4 shrink-0" />
                </button>

                <AnimatePresence>
                  {showGuestDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl"
                    >
                      <p
                        className="mb-4 text-xs font-bold uppercase"
                        style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
                      >
                        Number of guests
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setGuests((value) => Math.max(1, value - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xl font-bold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          style={{
                            borderColor: THEME.colors.border,
                            color: THEME.colors.textDark,
                          }}
                        >
                          -
                        </button>
                        <span
                          className="text-2xl font-black"
                          style={{ color: THEME.colors.textDark }}
                        >
                          {guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests((value) => Math.min(20, value + 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xl font-bold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          style={{
                            borderColor: THEME.colors.border,
                            color: THEME.colors.textDark,
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuestDrop(false)}
                        className="btn-primary mt-5 w-full py-2 text-xs"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex min-h-[88px] items-center p-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-[58px] w-full items-center justify-center gap-3 rounded-lg px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-[152px]"
                  style={{
                    background: THEME.colors.primary,
                    boxShadow: `0 10px 20px ${THEME.colors.primary}33`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.colors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = THEME.colors.primary;
                  }}
                >
                  {THEME.hero.searchCta}
                  <HiArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {(showDatePicker || showGuestDrop) && (
            <button
              type="button"
              aria-label="Close filters"
              className="fixed inset-0 z-10 cursor-default bg-transparent"
              onClick={closePickers}
            />
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-20 mx-auto w-full max-w-[1490px] px-6 pb-8 lg:absolute lg:left-0 lg:right-0 lg:top-[812px] lg:px-8 lg:pb-0"
      >
        <div className="grid overflow-hidden rounded-[26px] bg-white/95 shadow-[0_20px_55px_rgba(8,19,76,0.12)] ring-1 ring-black/5 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-5">
          {THEME.stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex min-h-[120px] items-center gap-5 px-7 py-6 ${
                index > 0 ? 'lg:border-l' : ''
              } ${index > 1 ? 'sm:border-t lg:border-t-0' : ''}`}
              style={{ borderColor: THEME.colors.border }}
            >
              <div
                className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full"
                style={{ background: `${stat.iconColor}1A` }}
              >
                <StatIcon color={stat.iconColor} iconKey={stat.iconKey} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[0.95rem] font-black uppercase leading-tight"
                  style={{ color: THEME.colors.textDark, letterSpacing: 0 }}
                >
                  {stat.label}
                </p>
                <p
                  className="mt-1 text-sm font-medium leading-snug"
                  style={{ color: THEME.colors.textMedium }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
