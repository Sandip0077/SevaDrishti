import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, change, changeType, variant = 'primary', delay = 0 }) {
  return (
    <motion.div
      className={`stats-card ${variant}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {Icon && (
        <div className={`stats-icon ${variant}`}>
          <Icon size={24} />
        </div>
      )}
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
      {change !== undefined && (
        <div className={`stats-change ${changeType || 'positive'}`}>
          {changeType === 'negative' ? '↓' : '↑'} {change}
        </div>
      )}
    </motion.div>
  );
}
