import { motion } from 'framer-motion';
import SkeletonLoader from '../common/SkeletonLoader';
import PropertyCard from '../properties/PropertyCard';

const FeaturedProperties = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} type="card" />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-10 text-center">
        <p className="font-semibold text-[var(--color-text-muted)]">
          No featured properties available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {properties.slice(0, 8).map((property, index) => (
        <motion.div
          key={property._id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(index * 0.05, 0.25), duration: 0.45 }}
        >
          <PropertyCard property={property} />
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedProperties;
