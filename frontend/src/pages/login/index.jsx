import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../../components/ui/GlowButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] flex">
      {/* Left: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12 group w-fit">
          <img src="/shortify.png" alt="Shortify logo" className="w-9 h-9 object-contain" />
          <span className="font-grotesk font-bold text-neutral-900 text-xl">
            Shortify
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <h1 className="font-grotesk font-bold text-4xl text-neutral-900 mb-2">Welcome back</h1>
          <p className="text-neutral-600 font-inter mb-8">Sign in to your dashboard</p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-inter"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-inter text-neutral-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-neutral-900 font-inter text-sm
                    placeholder:text-neutral-400 outline-none
                    focus:border-neutral-400 transition-all duration-200
                    border border-neutral-300 focus:ring-2 focus:ring-neutral-200
                    bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-inter text-neutral-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-11 pr-12 py-3.5 text-neutral-900 font-inter text-sm
                    placeholder:text-neutral-400 outline-none
                    focus:border-neutral-400 transition-all duration-200
                    border border-neutral-300 focus:ring-2 focus:ring-neutral-200
                    bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 !rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GlowButton>
          </form>

          <p className="mt-8 text-center text-neutral-500 font-inter text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: Visual Panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-white border-l border-neutral-200">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-20 h-20 rounded-3xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-8">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="font-display text-6xl leading-[0.9] text-neutral-900 mb-4 uppercase">
            Your links,
            <br />
            <span className="text-orange-500">organized</span>
          </h2>
          <p className="text-neutral-600 font-inter text-base max-w-sm mx-auto">
            Real-time analytics, custom aliases, QR codes — everything you need to own your links.
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { v: '<10ms', l: 'Redirect' },
              { v: '∞', l: 'Links' },
              { v: '24/7', l: 'Uptime' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl p-4 border border-neutral-200 bg-[#fafaf9]">
                <div className="font-grotesk font-bold text-xl text-neutral-900">{s.v}</div>
                <div className="text-neutral-500 text-xs font-inter mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
