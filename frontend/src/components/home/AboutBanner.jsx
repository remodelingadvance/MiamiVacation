import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaPlay,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import BuildingImage from '../../assets/buildingModel.png';
import BgImage from '../../assets/miamiBg.png';

const stats = [
  {
    value: '50K+',
    label: 'Happy Guests',
  },
  {
    value: '1K+',
    label: 'Luxury Homes',
  },
  {
    value: '24/7',
    label: 'Premium Support',
  },
];

const AboutBanner = () => {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-20
        lg:py-28
        bg-cover
        bg-center
        bg-no-repeat
      "
      style={{
        backgroundImage: `url(${BgImage})`,
      }}
    >

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="
            absolute
            top-[14%]
            left-[10%]
            w-3
            h-3
            rounded-full
            bg-pink-500
          "
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="
            absolute
            top-[24%]
            right-[14%]
            w-2
            h-2
            rounded-full
            bg-cyan-300
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="
            absolute
            bottom-[20%]
            left-[18%]
            w-4
            h-4
            rounded-full
            bg-blue-400
          "
        />

      </div>

      {/* CONTAINER */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-[1500px]
          mx-auto
          px-4
        "
      >

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >

            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="
                inline-flex
                items-center
                gap-3
                px-5
                py-3
                rounded-full
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
              "
            >

              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />

              <span className="text-pink-500 text-sm uppercase tracking-[3px] font-semibold">
                About Miami Stay
              </span>

            </motion.div>

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="
                mt-8
                text-[3.3rem]
                sm:text-[4.8rem]
                lg:text-[6.8rem]
                leading-[0.9]
                font-black
                uppercase
                font-hero
                text-rose-500
              "
            >

              More Than
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-pink-500
                  via-rose-400
                  to-cyan-300
                  bg-clip-text
                  text-transparent
                "
              >
                Just A Stay.
              </span>

            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="
                mt-8
                max-w-2xl
                text-rose-300
                text-[15px]
                sm:text-[17px]
                leading-[2]
              "
            >
              Miami Stay connects travelers from around the world
              with unforgettable luxury homes, beachfront villas,
              and authentic Miami experiences during FIFA World Cup
              2026™ and beyond.
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="
                flex
                flex-wrap
                gap-5
                mt-12
              "
            >

              {/* PRIMARY BUTTON */}
              <button
                className="
                  group
                  relative
                  overflow-hidden
                  px-9
                  py-4
                  rounded-2xl
                  bg-gradient-to-r
                  from-pink-500
                  to-rose-500
                  text-white
                  font-semibold
                  transition-all
                  duration-500
                  hover:scale-105
                "
              >

                <span className="relative z-10 flex items-center gap-3">

                  Explore Stays

                  <FaArrowRight
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />

                </span>

              </button>

              {/* SECONDARY BUTTON */}
              {/* <button
                className="
                  group
                  flex
                  items-center
                  gap-3
                  px-8
                  py-4
                  rounded-2xl
                  bg-white/10
                  backdrop-blur-xl
                  border
                  border-white/10
                  text-white
                  font-semibold
                  transition-all
                  duration-500
                  hover:bg-white
                  hover:text-[#07144C]
                "
              >

                <FaPlay />

                Watch Video

              </button> */}

            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="
                grid
                grid-cols-3
                gap-8
                mt-16
                max-w-2xl
              "
            >

              {stats.map((item, index) => (
                <div key={index}>

                  <h3
                    className="
                      text-primary
                      text-[2.8rem]
                      sm:text-[3.5rem]
                      font-black
                      font-hero
                    "
                  >
                    {item.value}
                  </h3>

                  <p className="text-rose-400 mt-2 text-sm sm:text-base">
                    {item.label}
                  </p>

                </div>
              ))}

            </motion.div>

          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="
              relative
              w-full
              max-w-[700px]
              ml-auto
            "
          >

            {/* IMAGE WRAPPER */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[40px]
                border
                border-white/10
              "
            >

              {/* IMAGE */}
              <img
                src={BuildingImage}
                alt="Miami Stay"
                className="
                  w-full
                  h-[420px]
                  sm:h-[520px]
                  lg:h-[720px]
                  object-contain
                "
              />

            </div>

            {/* TOP FLOATING CARD */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="
                absolute
                top-6
                right-[-10px]
                sm:right-[-25px]
                z-30
                bg-white
                rounded-[28px]
                px-6
                py-5
              "
            >

              <p className="text-slate-500 text-sm mt-1">
                Experience Miami Like Never Before
              </p>

            </motion.div>

            {/* BOTTOM GLASS CARD */}
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
              className="
                absolute
                -bottom-8
                left-4
                sm:left-[-40px]
                z-30
                glass
                rounded-[28px]
                px-6
                py-5
                border
                border-white/20
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-gradient-to-br
                    from-pink-500
                    to-rose-500
                    flex
                    items-center
                    justify-center
                    text-white
                    text-xl
                  "
                >
                  <FaMapMarkerAlt />
                </div>

                <div>

                  <p className="text-slate-500 text-sm">
                    Official Host City
                  </p>

                  <h4
                    className="
                      text-[#07144C]
                      text-2xl
                      font-black
                    "
                  >
                    Miami, Florida
                  </h4>

                </div>

              </div>

            </motion.div>

          </motion.div>

        </div>

      </div>

    </section>
  );
};

export default AboutBanner;