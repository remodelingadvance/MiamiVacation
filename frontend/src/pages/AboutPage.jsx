import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiStar, HiUsers, HiHome, HiShieldCheck, HiGlobe } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import { APP_CONFIG } from '../config/constants';

const AboutPage = () => {
  const stats = [
    { icon: HiHome, value: '500+', label: 'Luxury Properties' },
    { icon: HiUsers, value: '10,000+', label: 'Happy Guests' },
    { icon: HiStar, value: '4.9', label: 'Average Rating' },
    { icon: HiGlobe, value: '15+', label: 'Miami Neighborhoods' },
  ];

  const team = [
    { name: 'Sofia Martinez', role: 'CEO & Founder', image: '/team/sofia.jpg' },
    { name: 'Marcus Chen', role: 'Head of Operations', image: '/team/marcus.jpg' },
    { name: 'Isabella Rossi', role: 'Guest Experience Director', image: '/team/isabella.jpg' },
    { name: 'David Kim', role: 'Property Manager', image: '/team/david.jpg' },
  ];

  const values = [
    {
      icon: HiStar,
      title: 'Excellence',
      description: 'We curate only the finest properties that meet our rigorous standards of luxury and comfort.',
    },
    {
      icon: HiShieldCheck,
      title: 'Trust',
      description: 'Every property is verified and every booking is secured with our best price guarantee.',
    },
    {
      icon: HiUsers,
      title: 'Hospitality',
      description: 'Our dedicated team ensures every guest experiences the warmth of Miami hospitality.',
    },
    {
      icon: HiGlobe,
      title: 'Local Expertise',
      description: 'Deep knowledge of Miami\'s neighborhoods helps us match you with the perfect location.',
    },
  ];

  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Miami Luxury Rentals - your premier source for luxury vacation properties in Miami."
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[var(--color-bg-medium)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent" />
        <div className="container-custom relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="section-title text-white">
              About Miami Luxury Rentals
            </h1>
            <p className="section-subtitle mx-auto">
              Your gateway to extraordinary vacation experiences in the heart of Miami
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title text-white text-left">
                Our Story
              </h2>
              <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed">
                <p>
                  Founded in 2018, Miami Luxury Rentals was born from a passion for exceptional travel 
                  experiences and a deep love for Miami's vibrant culture and stunning coastline.
                </p>
                <p>
                  What started as a small collection of premium properties in South Beach has grown into 
                  Miami's most trusted luxury vacation rental platform, featuring over 500 carefully 
                  curated properties across the city's most desirable neighborhoods.
                </p>
                <p>
                  We believe that where you stay shapes your entire travel experience. That's why we 
                  personally inspect every property, ensuring it meets our exacting standards for luxury, 
                  comfort, and location.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="/images/about-story.jpg"
                  alt="Miami Luxury Rentals Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-strong rounded-2xl p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Est. 2018</p>
                  <p className="text-[var(--color-primary)] text-sm">Miami, Florida</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[var(--color-bg-medium)]">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-light flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[var(--color-text-secondary)] text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title text-white">Our Values</h2>
            <p className="section-subtitle mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center hover:border-[var(--color-primary)]/30 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-white font-display font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[var(--color-bg-medium)]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title text-white">Meet Our Team</h2>
            <p className="section-subtitle mx-auto">
              The passionate people behind your perfect Miami getaway
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-4 mx-auto w-48 h-48 rounded-2xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-white font-display font-bold">{member.name}</h3>
                <p className="text-[var(--color-primary)] text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title text-white">
              Ready to Experience Miami Luxury?
            </h2>
            <p className="section-subtitle mx-auto mb-8">
              Browse our collection of premium properties and start planning your dream vacation.
            </p>
            <Link to="/properties" className="btn-primary text-lg inline-block">
              Explore Properties
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;