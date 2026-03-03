import { motion } from 'framer-motion';

/**
 * FadeIn - simple fade (+ optional upward shift) on mount.
 * Props:
 *   delay    - stagger delay in seconds (default 0)
 *   duration - animation duration (default 0.4)
 *   y        - vertical offset to animate from (default 12)
 *   className - forwarded className
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  y = 12,
  className = '',
  as: Tag = 'div',
}) {
  const MotionTag = motion[Tag] ?? motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
