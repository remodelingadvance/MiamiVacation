import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary', prefix = '', suffix = '', loading = false }) => {
  const colorClasses = {
    primary: 'from-[var(--color-primary)]/20 to-transparent',
    success: 'from-[var(--color-success)]/20 to-transparent',
    warning: 'from-[var(--color-warning)]/20 to-transparent',
    error: 'from-[var(--color-error)]/20 to-transparent',
    info: 'from-[var(--color-info)]/20 to-transparent',
  };

  const iconColors = {
    primary: 'text-[var(--color-primary)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    error: 'text-[var(--color-error)]',
    info: 'text-[var(--color-info)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-card bg-gradient-to-br ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 skeleton rounded-lg" />
          ) : (
            <p className="text-2xl font-bold text-white">
              {prefix}
              <CountUp end={value} duration={2} separator="," />
              {suffix}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          {trend >= 0 ? (
            <HiTrendingUp className="w-4 h-4 text-[var(--color-success)]" />
          ) : (
            <HiTrendingDown className="w-4 h-4 text-[var(--color-error)]" />
          )}
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-[var(--color-text-muted)]">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;