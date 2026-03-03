import { motion } from 'framer-motion';

/**
 * SlideIn - slides in from a specified direction.
 * Props:
 *   direction - 'left' | 'right' | 'up' | 'down' (default 'up')
 *   delay     - delay in seconds (default 0)
 *   distance  - pixels to slide from (default 30)
 *   className - forwarded className
 *   once      - only animate once (default true)
 *   scroll    - use whileInView instead of animate (default false)
 */
export default function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  distance = 30,
  className = '',
  scroll = false,
}) {
  const directionMap = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: distance },
    right: { x: -distance },
  };

  const initial = { opacity: 0, ...directionMap[direction] };
  const visible = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
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
