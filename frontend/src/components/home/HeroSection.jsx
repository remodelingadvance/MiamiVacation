import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiLocationMarker, HiCalendar, HiUsers, HiStar, HiShieldCheck } from 'react-icons/hi';
import { DateRange } from 'react-date-range';
import { format, addDays } from 'date-fns';

const HeroSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      key: 'selection',
    },
  ]);
  const [guests, setGuests] = useState(2);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');
    window.location.href = `/properties?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/videos/miami-hero.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback image */}
        <div className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`} style={{ backgroundImage: 'url(/images/hero-fallback.jpg)' }} />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-white/80 text-sm mb-6">
              <HiStar className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Miami's #1 Luxury Rental Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Experience{' '}
              <span className="text-gradient">Luxury Living</span>
              <br />
              in Miami
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
              Discover extraordinary vacation rentals in Miami's most prestigious locations. 
              From oceanfront penthouses to modern Brickell condos, find your perfect luxury escape.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/properties" className="btn-primary text-lg px-8 py-4">
                Explore Properties
              </Link>
              <Link to="/about" className="btn-outline text-lg px-8 py-4">
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <HiShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <HiStar className="w-5 h-5 text-[var(--color-primary)]" />
                <span>4.9/5 Average Rating</span>
              </div>
            </div>
          </motion.div>

          {/* Search form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:justify-self-end"
          >
            <div className="glass-strong rounded-2xl p-6 sm:p-8 w-full max-w-md">
              <h3 className="text-xl font-display font-bold text-white mb-6">
                Find Your Perfect Stay
              </h3>

              <form onSubmit={handleSearch} className="space-y-4">
                {/* Location */}
                <div>
                  <label className="input-label">Location</label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]" />
                    <select className="input-field pl-10 appearance-none cursor-pointer">
                      <option value="">All Miami Locations</option>
                      <option value="south-beach">South Beach</option>
                      <option value="brickell">Brickell</option>
                      <option value="downtown">Downtown Miami</option>
                      <option value="coral-gables">Coral Gables</option>
                      <option value="key-biscayne">Key Biscayne</option>
                      <option value="wynwood">Wynwood</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="relative" ref={datePickerRef}>
                  <label className="input-label">Check-in - Check-out</label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]" />
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="input-field pl-10 text-left"
                    >
                      {format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                    </button>
                  </div>

                  {showDatePicker && (
                    <div className="absolute top-full mt-2 z-50">
                      <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setDateRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        minDate={new Date()}
                        rangeColors={['#C8A97E']}
                        className="rounded-xl overflow-hidden shadow-2xl"
                      />
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="input-label">Guests</label>
                  <div className="relative">
                    <HiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="input-field pl-10 appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
                  <HiSearch className="w-5 h-5" />
                  Search Available Properties
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/50" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;