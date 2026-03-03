import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * AnimatedCounter - counts from 0 to `to` when it enters the viewport.
 * Props:
 *   to       - target number
 *   duration - animation duration in ms (default 1400)
 *   prefix   - string before number (e.g. '$')
 *   suffix   - string after number (e.g. '%', '+', 'K')
 *   decimals - decimal places (default 0)
 *   className - forwarded className
 */
export default function AnimatedCounter({
  to,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const target = parseFloat(to);

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(+(eased * target).toFixed(decimals));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [isInView, to, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
