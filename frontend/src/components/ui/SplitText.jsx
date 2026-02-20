import { motion } from 'framer-motion';

export default function SplitText({ text, className = '', delay = 0, once = true }) {
  const words = text.split(' ');

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{ staggerChildren: 0.05, delayChildren: delay }}
      className={className}
    >
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
