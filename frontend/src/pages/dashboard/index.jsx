import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, BarChart2, Plus, LogOut,
  Zap, TrendingUp, MousePointer,
  RefreshCw, ChevronRight, ExternalLink, Calendar,
} from 'lucide-react';
import { API_BASE, BASE_DOMAIN } from './constants';
import { useAuth } from '../../context/AuthContext';
import { urlApi } from '../../services/api';
import { toast, ToastContainer } from '../../components/ui/Toast';
import StatCard from './StatCard';
import UrlRow from './UrlRow';
import AnalyticsModal from './AnalyticsModal';
import QrModal from './QrModal';
import CreatePanel from './CreatePanel';
import { PAGE_SIZE } from './constants';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [analyticsFor, setAnalyticsFor] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadUrls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await urlApi.getAll();
      setUrls(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUrls(); }, [loadUrls]);

  const handleCopy = async (shortCode) => {
    try {
      await navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/${shortCode}`);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await urlApi.delete(id);
      setUrls((prev) => {
        const next = prev.filter((u) => u.uuid !== id);
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, maxPage));
        return next;
      });
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQr = (shortCode) => setQrModal(shortCode);

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount ?? 0), 0);

  const navItems = [
    { id: 'create', label: 'New Link', icon: <Plus className="w-4 h-4" /> },
    { id: 'links', label: 'My Links', icon: <Link2 className="w-4 h-4" />, badge: urls.length || null },
    { id: 'stats', label: 'Stats', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-neutral-900">
      <ToastContainer />

      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/shortify.png" alt="Shortify logo" className="w-7 h-7 object-contain" />
            <span className="font-grotesk font-bold text-neutral-900">
              Shortify
            </span>
          </div>

          {/* Center nav */}
          <nav className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 border border-neutral-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-inter
                  transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:block">{item.label}</span>
                {item.badge ? (
                  <span className="ml-1 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Right — user + actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadUrls}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                hover:text-neutral-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1.5 text-xs font-inter text-neutral-500 hover:text-neutral-900
                px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ── CREATE ── */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CreatePanel
                onCreated={(newUrl) => {
                  setUrls((prev) => [newUrl, ...prev]);
                  setPage(1);
                }}
              />
            </motion.div>
          )}

          {/* ── LINKS ── */}
          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {/* Subheader */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-grotesk font-semibold text-neutral-900 text-lg">My Links</h2>
                  <p className="text-neutral-500 text-xs font-inter">
                    {urls.length} link{urls.length !== 1 ? 's' : ''} · {totalClicks} total clicks
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-1.5 text-xs font-inter font-medium
                    bg-neutral-900 text-white px-3 py-1.5 rounded-lg
                    hover:bg-black transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New link
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-7 h-7 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
              ) : urls.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 font-inter text-sm mb-1">No links yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="text-orange-600 hover:text-orange-700 text-sm font-inter mt-1 transition-colors"
                  >
                    Create your first link →
                  </button>
                </div>
              ) : (() => {
                const totalPages = Math.max(1, Math.ceil(urls.length / PAGE_SIZE));
                const safePage = Math.min(page, totalPages);
                const pageUrls = urls.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

                const getPageNums = () => {
                  const nums = new Set([1, totalPages]);
                  for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages, safePage + 1); i++) nums.add(i);
                  return [...nums].sort((a, b) => a - b);
                };

                return (
                  <>
                    <AnimatePresence>
                      {pageUrls.map((url, i) => (
                        <UrlRow
                          key={url.uuid}
                          url={url}
                          index={i}
                          onCopy={handleCopy}
                          onDelete={handleDelete}
                          onQr={handleQr}
                          onAnalytics={setAnalyticsFor}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500 font-inter">
                          {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, urls.length)} of {urls.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                              hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30
                              disabled:cursor-not-allowed transition-all text-xs"
                          >
                            ‹
                          </button>
                          {getPageNums().map((num, idx, arr) => (
                            <>
                              {idx > 0 && arr[idx - 1] < num - 1 && (
                                <span key={`ellipsis-${num}`} className="w-7 h-7 flex items-center justify-center text-neutral-400 text-xs">…</span>
                              )}
                              <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${
                                  num === safePage
                                    ? 'bg-neutral-900 text-white border border-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                }`}
                              >
                                {num}
                              </button>
                            </>
                          ))}
                          <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                              hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30
                              disabled:cursor-not-allowed transition-all text-xs"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-grotesk font-semibold text-neutral-900 text-lg mb-1">Overview</h2>
                <p className="text-neutral-500 text-xs font-inter">Stats across all your links</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<Link2 className="w-4 h-4 text-neutral-900" />}
                  label="Total Links"
                  value={urls.length}
                  gradient="bg-violet-500/5"
                />
                <StatCard
                  icon={<MousePointer className="w-4 h-4 text-neutral-700" />}
                  label="Total Clicks"
                  value={totalClicks}
                  gradient="bg-cyan-500/5"
                />
                <StatCard
                  icon={<TrendingUp className="w-4 h-4 text-neutral-700" />}
                  label="Avg. Clicks"
                  value={urls.length ? Math.round(totalClicks / urls.length) : 0}
                  sub="per link"
                  gradient="bg-emerald-500/5"
                />
                <StatCard
                  icon={<Zap className="w-4 h-4 text-orange-600" />}
                  label="Cache Status"
                  value="Active"
                  sub="Redis"
                  gradient="bg-yellow-500/5"
                />
              </div>

              {/* Top links table */}
              {urls.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-grotesk font-medium text-neutral-900">Top links by clicks</p>
                      <p className="text-xs text-neutral-400 font-inter mt-0.5">Sorted by total click volume</p>
                    </div>
                    <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-lg">
                      top {Math.min(8, urls.length)}
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {[...urls]
                      .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
                      .slice(0, 8)
                      .map((url, idx) => {
                        const pct = totalClicks > 0 ? ((url.clickCount ?? 0) / totalClicks) * 100 : 0;
                        const favicon = (() => {
                          try { return `https://icons.duckduckgo.com/ip3/${new URL(url.originalUrl).hostname}.ico`; }
                          catch { return null; }
                        })();
                        const createdDate = url.createdAt
                          ? new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : null;
                        const rankColors = ['text-orange-500', 'text-neutral-500', 'text-amber-600'];
                        const rankBg = ['bg-orange-50 border-orange-200', 'bg-neutral-50 border-neutral-200', 'bg-amber-50 border-amber-200'];

                        return (
                          <div key={url.uuid} className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors group">
                            {/* Rank */}
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold
                              ${idx < 3 ? rankBg[idx] + ' ' + rankColors[idx] : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}>
                              {idx + 1}
                            </div>

                            {/* Favicon + URLs */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {favicon && (
                                  <img src={favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0 object-contain"
                                    onError={(e) => e.currentTarget.style.display = 'none'} />
                                )}
                                <a
                                  href={`${API_BASE}/${url.shortUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs text-neutral-900 hover:text-orange-600 transition-colors truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {BASE_DOMAIN}/{url.shortUrl}
                                </a>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-neutral-400 font-inter truncate leading-tight">
                                {url.originalUrl}
                              </p>
                            </div>

                            {/* Progress + stats */}
                            <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-36">
                              <div className="w-full bg-neutral-100 rounded-full h-1 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                                  className="h-full rounded-full bg-orange-500"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                                {createdDate && (
                                  <span className="flex items-center gap-0.5">
                                    <Calendar className="w-2.5 h-2.5" />{createdDate}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Click count */}
                            <div className="flex flex-col items-end flex-shrink-0 w-16">
                              <span className="text-sm font-grotesk font-semibold text-neutral-900">
                                {(url.clickCount ?? 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {pct.toFixed(1)}%
                              </span>
                            </div>

                            {/* Analytics button */}
                            <button
                              onClick={() => setAnalyticsFor(url.shortUrl)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                hover:text-neutral-900 hover:bg-neutral-100 transition-all flex-shrink-0"
                              title="View analytics"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Analytics modal */}
      <AnimatePresence>
        {analyticsFor && (
          <AnalyticsModal shortCode={analyticsFor} onClose={() => setAnalyticsFor(null)} />
        )}
      </AnimatePresence>

      {/* QR code modal */}
      <AnimatePresence>
        {qrModal && (
          <QrModal shortCode={qrModal} onClose={() => setQrModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
