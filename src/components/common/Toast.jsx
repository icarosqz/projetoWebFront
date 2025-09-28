// src/components/common/Toast.jsx
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

export function Toast({ message, onClose, type = 'success', duration = 3000 }) {
  // Fecha automaticamente após a duração definida
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-lg shadow-lg px-4 py-3 min-w-[320px] max-w-md border-l-4 border-green-500"
    >
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
      <span className="text-gray-700">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
}