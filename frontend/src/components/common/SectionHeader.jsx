import { motion } from 'framer-motion';

const SectionHeader = ({ 
  title, 
  subtitle, 
  align = 'center',
  titleColor = 'white',
  className = '' 
}) => {
  const alignmentClasses = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${alignmentClasses[align]} ${className}`}
    >
      <h2 
        className="section-title"
        style={{ color: titleColor }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="section-subtitle mt-4 mx-auto">
          {subtitle}
        </p>
      )}
      <div className="divider mt-6" />
    </motion.div>
  );
};

export default SectionHeader;