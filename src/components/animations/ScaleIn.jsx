import { motion } from 'framer-motion';

/**
 * ScaleIn - scales in from slightly smaller, fades in.
 * Props:
 *   delay    - delay in seconds (default 0)
 *   scroll   - use whileInView (default false)
 *   className - forwarded className
 */
export default function ScaleIn({
  children,
  delay = 0,
  scroll = false,
  className = '',
}) {
  const initial = { opacity: 0, scale: 0.94 };
  const visible = {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  };

  if (scroll) {
    return (
      <motion.div
        initial={initial}
        whileInView={visible}
        viewport={{ once: true, margin: '-60px' }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      animate={visible}
      className={className}
    >
      {children}
    </motion.div>
  );
}
