import { motion } from "framer-motion";
import {
  HiOutlineArrowsExpand,
  HiOutlineBriefcase,
  HiOutlineTruck,
} from "react-icons/hi";
import { MdOutlineBed, MdOutlineBathtub } from "react-icons/md";
import BGImage from "../../assets/ctabg.png";

const stats = [
  {
    label: "Square Feet",
    value: "2389",
    icon: HiOutlineArrowsExpand,
  },
  {
    label: "Bath Rooms",
    value: "3",
    icon: MdOutlineBathtub,
  },
  {
    label: "Bed Rooms",
    value: "6",
    icon: MdOutlineBed,
  },
  {
    label: "Car Parking",
    value: "1",
    icon: HiOutlineTruck,
  },
];

const StatsSection = ({
  backgroundImage = BGImage,
  items = stats,
}) => {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="group flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ y: -5, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 280, damping: 14 }}
                  className="mb-3 text-[#E73968]"
                >
                  <Icon className="h-11 w-11 stroke-[1.6]" />
                </motion.div>

                <motion.h3
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 + 0.15 }}
                  className="text-lg font-black leading-none text-white sm:text-xl"
                >
                  {item.value}
                </motion.h3>

                <p className="mt-1 text-xs font-bold text-white/90 sm:text-sm">
                  {item.label}
                </p>

                <span className="mt-3 h-[2px] w-0 rounded-full bg-[#E73968] transition-all duration-300 group-hover:w-10" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;