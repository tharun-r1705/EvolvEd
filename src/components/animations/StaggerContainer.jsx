import { motion } from 'framer-motion';

/**
 * StaggerContainer - parent wrapper that orchestrates staggered children.
 * Children should be wrapped with StaggerItem.
 * Props:
 *   staggerDelay - delay between each child (default 0.07s)
 *   delayChildren - initial delay before first child animates (default 0.05s)
 *   className - forwarded className
 */
export default function StaggerContainer({
  children,
  staggerDelay = 0.07,
  delayChildren = 0.05,
  className = '',
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
