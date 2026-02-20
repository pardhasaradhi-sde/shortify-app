import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5 border border-neutral-200 bg-white"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-xs font-inter text-neutral-500 uppercase tracking-wider">{label}</span>
        </div>
        <p className="font-grotesk font-bold text-3xl text-neutral-900">{value}</p>
        {sub && <p className="text-xs text-neutral-500 font-inter mt-1">{sub}</p>}
      </div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-orange-100 blur-xl" />
    </motion.div>
  );
}
