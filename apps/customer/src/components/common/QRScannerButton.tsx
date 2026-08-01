import React, { useState } from 'react';
import { QrCode, Scan } from 'lucide-react';
import { triggerHaptic } from '@/src/utils/haptics';
import { QRScannerModal } from './QRScannerModal';

interface QRScannerButtonProps {
  variant?: 'icon' | 'badge' | 'button' | 'full';
  className?: string;
  onScanned?: (code: string, redemptionInfo?: any) => void;
}

export const QRScannerButton: React.FC<QRScannerButtonProps> = ({
  variant = 'icon',
  className = '',
  onScanned
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    triggerHaptic('medium');
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'icon' && (
        <button
          onClick={handleClick}
          className={`relative w-10 h-10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-95 transition-all rounded-xl cursor-pointer ${className}`}
          aria-label="Scan QR Code"
          title="Scan QR Code or Loyalty Pass"
        >
          <Scan className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        </button>
      )}

      {variant === 'badge' && (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan QR Pass</span>
        </button>
      )}

      {variant === 'button' && (
        <button
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <Scan className="w-4 h-4" />
          <span>Scan Code / Pass</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          onClick={handleClick}
          className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer ${className}`}
        >
          <Scan className="w-4 h-4" />
          <span>Scan Loyalty QR or Pass</span>
        </button>
      )}

      <QRScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onScanned}
      />
    </>
  );
};
