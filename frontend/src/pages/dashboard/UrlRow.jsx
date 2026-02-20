import { motion } from 'framer-motion';
import { Copy, QrCode, BarChart2, Trash2, ExternalLink, MousePointer } from 'lucide-react';
import { API_BASE, BASE_DOMAIN } from './constants';

export default function UrlRow({ url, onDelete, onAnalytics, onCopy, onQr, index }) {
  const favicon = (() => {
    try { return `https://icons.duckduckgo.com/ip3/${new URL(url.originalUrl).hostname}.ico`; }
    catch { return null; }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-neutral-200 bg-white
        hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200"
    >
      {/* Favicon (falls back to dot if unavailable) */}
      {favicon ? (
        <img
          src={favicon}
          alt=""
          className="w-4 h-4 rounded-sm flex-shrink-0 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'block');
          }}
        />
      ) : null}
      {/* Fallback dot — hidden when favicon loads */}
      <div
        className="w-2 h-2 rounded-full bg-neutral-400 flex-shrink-0 group-hover:bg-orange-500 transition-colors"
        style={{ display: favicon ? 'none' : 'block' }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <a
            href={`${API_BASE}/${url.shortUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-neutral-900 hover:text-orange-600 transition-colors truncate"
          >
            {BASE_DOMAIN}/{url.shortUrl}
          </a>
          <ExternalLink className="w-3 h-3 text-neutral-400 flex-shrink-0" />
        </div>
        <p className="text-xs text-neutral-500 truncate font-inter">{url.originalUrl}</p>
      </div>

      {/* Click count */}
      <div className="hidden sm:flex items-center gap-1 text-xs font-inter text-neutral-500 flex-shrink-0">
        <MousePointer className="w-3 h-3" />
        {url.clickCount ?? 0}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {[
          { icon: <Copy className="w-3.5 h-3.5" />, fn: () => onCopy(url.shortUrl), title: 'Copy', color: 'hover:text-neutral-900' },
          { icon: <QrCode className="w-3.5 h-3.5" />, fn: () => onQr(url.shortUrl), title: 'QR Code', color: 'hover:text-neutral-900' },
          { icon: <BarChart2 className="w-3.5 h-3.5" />, fn: () => onAnalytics(url.shortUrl), title: 'Analytics', color: 'hover:text-neutral-900' },
          { icon: <Trash2 className="w-3.5 h-3.5" />, fn: () => onDelete(url.uuid), title: 'Delete', color: 'hover:text-red-400' },
        ].map((btn) => (
          <button
            key={btn.title}
            onClick={btn.fn}
            title={btn.title}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 ${btn.color} transition-colors`}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
