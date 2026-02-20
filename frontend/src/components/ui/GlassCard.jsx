import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  animate = true,
}) {
  const Component = animate ? motion.div : 'div';
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      {...animateProps}
      className={`
        glass rounded-2xl
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${glow ? 'hover:shadow-lg hover:shadow-black/30' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
