import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './primitives';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go back',
  danger,
  loading,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              {danger && (
                <div className="mt-0.5 rounded-2xl bg-rose-50 p-2 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                className={`flex-1 rounded-2xl h-12 ${danger ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Please wait…' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
