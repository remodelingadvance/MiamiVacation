import {
  FaHome,
  FaShieldAlt,
  FaStar,
  FaHeadset,
  FaQuoteLeft,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
} from 'react-icons/fa';

import { motion } from 'framer-motion';

const features = [
  {
    icon: <FaHome />,
    title: 'Curated With Care',
    desc: 'Every home is carefully selected for quality, comfort, and location.',
    bg: 'bg-pink-100',
    iconColor: 'text-pink-500',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Trusted & Secure',
    desc: 'Verified properties, secure booking, and 24/7 support you can count on.',
    bg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    icon: <FaStar />,
    title: 'Local Expertise',
    desc: 'Our local team lives in Miami and knows the city inside out.',
    bg: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  {
    icon: <FaHeadset />,
    title: 'Here For You',
    desc: 'From planning to checkout, we’re here to make your stay effortless.',
    bg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
];

const stats = [
  {
    icon: <FaBuilding />,
    value: '1K+',
    label: 'Handpicked Properties',
    color: 'bg-pink-500',
  },
  {
    icon: <FaUsers />,
    value: '50K+',
    label: 'Happy Guests',
    color: 'bg-blue-500',
  },
  {
    icon: <FaCalendarAlt />,
    value: '10+',
    label: 'Years of Hospitality',
    color: 'bg-green-500',
  },
  {
    icon: <FaCheckCircle />,
    value: '100%',
    label: 'Guest Satisfaction',
    color: 'bg-orange-400',
  },
];

const StorySection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-100 blur-[120px] opacity-40 rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 blur-[120px] opacity-40 rounded-full" />

      <div className="max-w-[1500px] mx-auto relative z-10">

        {/* TOP SECTION */}
        <div className="grid lg:grid-cols-[1.1fr_2fr] gap-10 items-start mx-4">

          {/* LEFT TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >

            <p className="uppercase tracking-[3px] text-primary text-sm font-bold mb-4">
              OUR STORY
            </p>

            <h2 className="text-[2.4rem] sm:text-[3rem] leading-[1.05] font-black text-[#07144C] font-hero max-w-md">
              Built for the World.
              <br />
              Inspired by Miami.
            </h2>

            <p className="mt-6 text-[#5E6985] leading-[1.9] text-[15px] max-w-xl">
              When the world comes to Miami for the FIFA World Cup
              2026™, we’re here to make every stay exceptional.
              Founded by locals who love this city, Miami Stay was
              created to offer handpicked homes, seamless service,
              and authentic Miami experiences — so you can live the
              game, your way.
            </p>

          </motion.div>

          {/* FEATURE CARDS */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">

            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="
                  group
                  bg-white
                  rounded-[28px]
                  border
                  border-[#EEF1F6]
                  p-7
                  shadow-[0_10px_40px_rgba(0,0,0,0.04)]
                  transition-all
                  duration-500
                  hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)]
                  relative
                  overflow-hidden
                "
              >

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-blue-50 opacity-0 group-hover:opacity-100 transition duration-500" />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`
                    relative z-10
                    w-16 h-16
                    rounded-2xl
                    flex items-center justify-center
                    text-2xl
                    ${item.bg}
                    ${item.iconColor}
                  `}
                >
                  {item.icon}
                </motion.div>

                <h3 className="relative z-10 mt-6 text-[1.25rem] font-bold text-[#07144C]">
                  {item.title}
                </h3>

                <p className="relative z-10 mt-4 text-[#69758F] leading-[1.8] text-[14px]">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>
        </div>

        {/* STATS BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 90 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="
            relative
            mt-16
            overflow-hidden
            rounded-[32px]
            mx-4
          "
        >

          {/* Background Image */}
          <div
            className="
              absolute inset-0
              bg-cover
              bg-center
              scale-110
            "
            style={{
              backgroundImage:
                "url('/images/miami-world-cup-hero.png')",
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B5D]/80 via-[#0C1B5D]/60 to-[#0C1B5D]/80" />

          {/* Floating Blur */}
          <div className="absolute -top-10 left-1/3 w-72 h-72 bg-pink-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-500/20 blur-[120px] rounded-full" />

          <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 p-8 md:p-14 items-center">

            {/* LEFT STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

              {stats.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                  className="text-center text-white"
                >

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className={`
                      mx-auto
                      w-14 h-14
                      rounded-full
                      flex items-center justify-center
                      text-xl
                      ${item.color}
                      shadow-lg
                    `}
                  >
                    {item.icon}
                  </motion.div>

                  <h3 className="mt-5 text-[2rem] font-black font-hero">
                    {item.value}
                  </h3>

                  <p className="mt-2 text-white/80 text-sm leading-[1.6]">
                    {item.label}
                  </p>

                </motion.div>
              ))}

            </div>

            {/* RIGHT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
              className="text-white"
            >

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="text-pink-500 text-5xl"
              >
                <FaQuoteLeft />
              </motion.div>

              <h3 className="mt-4 text-[2rem] md:text-[2.5rem] leading-[1.2] font-black font-hero">
                We’re not just a booking platform.
                <br />
                We’re your local host in Miami.
              </h3>

              <p className="mt-6 text-white/80 leading-[1.9] max-w-xl">
                From sunny beaches to electric fan zones, from
                luxury villas to cozy beach houses — Miami Stay is
                your gateway to the ultimate World Cup experience.
              </p>

              <motion.h4
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="
                  mt-6
                  text-[2.4rem]
                  font-signature
                  text-pink-400
                  italic
                  font-bold
                "
              >
                Welcome to Miami!
              </motion.h4>

            </motion.div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default StorySection;