import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Share2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { API_BASE } from './constants';

export default function QrModal({ shortCode, onClose }) {
  const shortLink = `${API_BASE}/${shortCode}`;
  const qrSrc = `${API_BASE}/api/urls/${shortCode}/qr?size=400`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied!');
    } catch { toast.error('Copy failed'); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Shortened link', url: shortLink }); return; }
      catch { /* user cancelled */ }
    }
    handleCopy();
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${shortCode}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error('QR download failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6"
        style={{ boxShadow: '0 20px 65px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-grotesk font-bold text-neutral-900 text-sm">QR Code</h3>
            <p className="text-neutral-500 text-xs font-mono mt-0.5">/{shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500
              hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Image */}
        <div
          className="rounded-2xl bg-white p-5 flex items-center justify-center mb-5"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }}
        >
          <img
            src={qrSrc}
            alt={`QR for ${shortLink}`}
            className="w-52 h-52 object-contain"
          />
        </div>

        {/* Short link pill — click to copy */}
        <div
          className="flex items-center gap-3 bg-[#fafaf9] border border-neutral-200 rounded-xl
            px-4 py-3 mb-4 cursor-pointer group"
          onClick={handleCopy}
          title="Click to copy"
        >
          <span className="flex-1 font-mono text-neutral-900 text-xs truncate">{shortLink}</span>
          {copied
            ? <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            : <Copy className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 transition-colors flex-shrink-0" />}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Copy className="w-4 h-4" />, label: copied ? 'Copied!' : 'Copy', fn: handleCopy, color: 'text-neutral-900' },
            { icon: <Share2 className="w-4 h-4" />, label: 'Share', fn: handleShare, color: 'text-neutral-700' },
            { icon: <Download className="w-4 h-4" />, label: 'Save QR', fn: handleDownload, color: 'text-neutral-700' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.fn}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl
                bg-[#fafaf9] border border-neutral-200 hover:border-neutral-300
                hover:bg-neutral-50 transition-all text-xs font-inter ${btn.color}`}
            >
              {btn.icon}
              <span className="text-neutral-500">{btn.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
