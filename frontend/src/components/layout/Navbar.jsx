import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../ui/GlowButton';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isLanding ? 'bg-white/90 backdrop-blur-sm border-b border-neutral-200' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/shortify.png" alt="Shortify logo" className="w-8 h-8 object-contain" />
              <span className="font-grotesk font-bold text-neutral-900 text-lg">
                Shortify
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-slate-400 text-sm font-inter">
                    {user?.email}
                  </span>
                  <GlowButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </GlowButton>
                  <GlowButton variant="ghost" size="sm" onClick={handleLogout}>
                    Sign Out
                  </GlowButton>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-neutral-600 hover:text-neutral-900 text-sm font-inter transition-colors px-2 py-2"
                  >
                    Sign In
                  </Link>
                  <GlowButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Get Started
                  </GlowButton>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-neutral-600 hover:text-neutral-900 transition-colors p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-neutral-200 p-4 flex flex-col gap-3 md:hidden"
          >
            {isAuthenticated ? (
              <>
                <p className="text-neutral-500 text-sm font-inter px-2">{user?.email}</p>
                <button
                  onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                  className="text-left text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-left text-neutral-600 px-3 py-2 rounded-lg hover:bg-neutral-100 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-orange-600 font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
