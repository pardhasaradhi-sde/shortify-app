import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-orange-600" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <AlertCircle className="w-5 h-5 text-neutral-700" />,
};

const colors = {
  success: 'border-orange-200 shadow-black/10',
  error: 'border-red-200 shadow-black/10',
  info: 'border-neutral-200 shadow-black/10',
};

// Global toast state — simple singleton pattern
let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error: (msg) => toastFn?.('error', msg),
  info: (msg) => toastFn?.('info', msg),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (type, message) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { toastFn = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`
              glass rounded-xl px-4 py-3 flex items-center gap-3
              shadow-xl border ${colors[t.type]}
              min-w-[280px] max-w-[380px]
            `}
          >
            {icons[t.type]}
            <p className="text-sm text-neutral-900 flex-1 font-inter">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-neutral-500 hover:text-neutral-900 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
