import { motion } from 'framer-motion';

/**
 * ScrollReveal - triggers animation when element enters viewport.
 * Uses whileInView so it fires once (once: true) as user scrolls.
 * Props:
 *   delay     - delay in seconds (default 0)
 *   y         - vertical offset (default 20)
 *   className - forwarded className
 */
export default function ScrollReveal({
  children,
  delay = 0,
  y = 20,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
