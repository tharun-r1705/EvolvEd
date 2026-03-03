import { motion } from 'framer-motion';

/**
 * StaggerItem - child of StaggerContainer. Fades in upward with stagger timing.
 * Props:
 *   className - forwarded className
 *   y         - vertical offset (default 16)
 */
export default function StaggerItem({ children, className = '', y = 16 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
