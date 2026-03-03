import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedModal - wraps modal/drawer content with smooth enter/exit.
 * Props:
 *   isOpen    - boolean controlling visibility
 *   onClose   - called when backdrop is clicked
 *   children  - modal content
 *   className - forwarded to the modal panel
 */
export default function AnimatedModal({ isOpen, onClose, children, className = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
            style={{ position: 'relative', zIndex: 50 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
