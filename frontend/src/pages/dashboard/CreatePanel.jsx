import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, X, ArrowRight, Sparkles, Command, Copy,
  Download, Share2, CheckCircle2,
} from 'lucide-react';
import { urlApi } from '../../services/api';
import { toast } from '../../components/ui/Toast';
import { API_BASE, BASE_DOMAIN } from './constants';

export default function CreatePanel({ onCreated }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (!createdUrl) inputRef.current?.focus(); }, [createdUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const result = await urlApi.create(url.trim(), alias.trim());
      setCreatedUrl(result);
      onCreated(result);
    } catch (err) {
      toast.error(err.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const shortLink = createdUrl ? `${API_BASE}/${createdUrl.shortUrl}` : '';
  const qrSrc = createdUrl ? `${API_BASE}/api/urls/${createdUrl.shortUrl}/qr?size=400` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Shortened link', url: shortLink });
        return;
      } catch { /* user cancelled */ }
    }
    handleCopy();
    toast.success('Link copied (share not supported on this browser)');
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${createdUrl.shortUrl}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { toast.error('QR download failed'); }
  };

  const isValidUrl = url.trim().startsWith('http://') || url.trim().startsWith('https://');

  // ── Success state — show QR + actions ─────────────────────────────────────
  if (createdUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="w-full max-w-md"
        >
          {/* Check badge */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200
              flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-orange-600" />
            </div>
          </div>

          {/* Short link pill */}
          <div
            className="flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl
              px-5 py-4 mb-4 cursor-pointer group"
            onClick={handleCopy}
            title="Click to copy"
          >
            <span className="flex-1 font-mono text-neutral-900 text-sm truncate">{shortLink}</span>
            <motion.span
              key={copied ? 'check' : 'copy'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-neutral-500 group-hover:text-neutral-900 transition-colors flex-shrink-0"
            >
              {copied
                ? <CheckCircle2 className="w-4 h-4 text-orange-600" />
                : <Copy className="w-4 h-4" />}
            </motion.span>
          </div>

          {/* QR code */}
          <div
            className="rounded-2xl bg-white p-4 mb-4 flex items-center justify-center"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <img
              src={qrSrc}
              alt={`QR code for ${shortLink}`}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: <Copy className="w-4 h-4" />, label: copied ? 'Copied!' : 'Copy Link', fn: handleCopy, color: 'text-neutral-900' },
              { icon: <Share2 className="w-4 h-4" />, label: 'Share', fn: handleShare, color: 'text-neutral-700' },
              { icon: <Download className="w-4 h-4" />, label: 'Save QR', fn: handleDownloadQr, color: 'text-neutral-700' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.fn}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl
                  bg-white border border-neutral-200 hover:border-neutral-300
                  hover:bg-neutral-50 transition-all text-xs font-inter ${btn.color}`}
              >
                {btn.icon}
                <span className="text-neutral-500">{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Create another */}
          <button
            onClick={() => { setCreatedUrl(null); setUrl(''); setAlias(''); }}
            className="w-full py-3 rounded-xl border border-neutral-300 text-neutral-600
              hover:text-neutral-900 hover:border-neutral-400 transition-all text-sm font-inter"
          >
            + Create another link
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-neutral-600 text-sm font-inter mb-4">
            <Sparkles className="w-4 h-4" />
            <span>URL Shortener</span>
          </div>
          <h1 className="font-grotesk font-bold text-3xl sm:text-4xl text-neutral-900 mb-2">
            Paste your long URL
          </h1>
          <p className="text-neutral-500 font-inter text-sm">
            Get a short link in seconds. No setup required.
          </p>
        </div>

        {/* Main input box */}
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={{
              boxShadow: url
                ? '0 0 0 1px rgba(251,146,60,0.5), 0 18px 45px rgba(0,0,0,0.08)'
                : '0 0 0 1px rgba(23,23,23,0.12), 0 8px 25px rgba(0,0,0,0.06)',
            }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white overflow-hidden"
          >
            <div className="flex items-center px-5 py-4 gap-3">
              <Link2 className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${url ? 'text-orange-600' : 'text-neutral-400'}`} />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-that-nobody-wants-to-type"
                className="flex-1 bg-transparent text-neutral-900 font-inter text-sm placeholder:text-neutral-400 outline-none min-w-0"
              />
              {url && (
                <button type="button" onClick={() => setUrl('')}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showAlias && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 overflow-hidden"
                >
                  <div className="flex items-center px-5 py-3.5 gap-2">
                    <span className="text-neutral-400 font-mono text-sm flex-shrink-0">{BASE_DOMAIN}/</span>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="custom-alias  (optional)"
                      maxLength={20}
                      className="flex-1 bg-transparent text-neutral-900 font-mono text-sm placeholder:text-neutral-400 outline-none min-w-0"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 gap-4">
              <button
                type="button"
                onClick={() => setShowAlias((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-inter transition-colors ${
                  showAlias ? 'text-orange-600' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Command className="w-3.5 h-3.5" />
                {showAlias ? 'Hide alias' : 'Custom alias'}
              </button>

              <motion.button
                type="submit"
                disabled={!isValidUrl || loading}
                whileHover={{ scale: isValidUrl ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-inter font-medium
                  transition-all duration-300 ${
                    isValidUrl
                      ? 'bg-neutral-900 text-white hover:bg-black'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (<>Shorten <ArrowRight className="w-3.5 h-3.5" /></>)}
              </motion.button>
            </div>
          </motion.div>
        </form>

        <p className="text-center text-neutral-500 text-xs font-inter mt-4">
          Tip: add a custom alias to make it memorable — e.g.{' '}
          <span className="font-mono text-neutral-700">{BASE_DOMAIN}/my-brand</span>
        </p>
      </motion.div>
    </div>
  );
}
