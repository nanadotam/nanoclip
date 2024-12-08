import { motion } from 'framer-motion';
import { QRCodeCard } from './QRCodeCard';

export function MobileQRSlider({ isOpen, onClose, clipUrl, expiryDate }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 rounded-t-2xl shadow-lg z-50"
    >
      <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
      <QRCodeCard clipUrl={clipUrl} expiryDate={expiryDate} />
      <button
        onClick={onClose}
        className="mt-4 w-full text-sm text-muted-foreground"
      >
        Close
      </button>
    </motion.div>
  );
} 