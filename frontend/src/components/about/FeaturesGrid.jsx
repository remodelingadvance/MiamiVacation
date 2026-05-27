import { motion } from 'framer-motion';

const features = [
  {
    title: 'Curated With Care',
    desc: 'Handpicked premium stays.',
    color: 'bg-pink-100',
  },
  {
    title: 'Trusted & Secure',
    desc: 'Safe booking experience.',
    color: 'bg-blue-100',
  },
  {
    title: 'Local Expertise',
    desc: 'Real Miami experience.',
    color: 'bg-green-100',
  },
  {
    title: '24/7 Support',
    desc: 'Always here for you.',
    color: 'bg-purple-100',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-20">
      <div className="container-custom grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {features.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{
              y: -12,
            }}
            className="glass rounded-3xl p-8 card-hover"
          >
            <div className={`w-16 h-16 rounded-2xl ${item.color}`} />

            <h3 className="mt-6 text-2xl font-bold text-[#07144C]">
              {item.title}
            </h3>

            <p className="mt-3 text-slate-500">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>
    </section>
  );
};

export default FeaturesGrid;