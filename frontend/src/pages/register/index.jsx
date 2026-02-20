import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../../components/ui/GlowButton';
import PasswordStrength from './PasswordStrength';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] flex">
      {/* Right: Visual Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-white order-last border-l border-neutral-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-14"
        >
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { label: 'Avg. redirect', val: '<10ms' },
              { label: 'Custom aliases', val: '✓' },
              { label: 'QR codes', val: '✓' },
              { label: 'Analytics', val: 'Live' },
            ].map((item) => (
              <div key={item.label} className="border border-neutral-200 rounded-2xl p-4 text-center bg-[#fafaf9]">
                <div className="font-grotesk font-bold text-xl text-neutral-900 mb-1">{item.val}</div>
                <div className="text-neutral-500 text-xs font-inter">{item.label}</div>
              </div>
            ))}
          </div>
          <h2 className="font-display text-6xl leading-[0.9] text-neutral-900 mb-4 uppercase">
            Join{' '}
            <span className="text-orange-500">thousands</span>
            <br />
            of creators
          </h2>
          <p className="text-neutral-600 font-inter text-base max-w-xs mx-auto leading-relaxed">
            Free forever. No credit card. Start shortening links in seconds.
          </p>
        </motion.div>
      </div>

      {/* Left: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 mb-12 group w-fit">
          <img src="/shortify.png" alt="Shortify logo" className="w-9 h-9 object-contain" />
          <span className="font-grotesk font-bold text-neutral-900 text-xl">
            Shortify
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full"
        >
          <p className="text-neutral-500 text-sm font-inter uppercase tracking-widest mb-3">Get started</p>
          <h1 className="font-grotesk font-bold text-4xl text-neutral-900 mb-2 tracking-tight">Create account</h1>
          <p className="text-neutral-600 font-inter mb-10">Free forever. No credit card required.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-inter"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder:text-neutral-400 outline-none bg-white
                    border border-neutral-300 focus:border-neutral-400
                    focus:ring-2 focus:ring-neutral-200 transition-all duration-200"
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
                  placeholder="Create a strong password"
                  className="w-full rounded-xl pl-11 pr-12 py-3.5 text-neutral-900 font-inter text-sm
                    placeholder:text-neutral-400 outline-none bg-white
                    border border-neutral-300 focus:border-neutral-400
                    focus:ring-2 focus:ring-neutral-200 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-inter text-neutral-700 mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-xl pl-11 pr-4 py-3.5 bg-white
                    text-neutral-900 font-inter text-sm placeholder:text-neutral-400 outline-none
                    border transition-all focus:ring-2
                    ${confirmPassword && password !== confirmPassword
                      ? 'border-red-500/50 focus:ring-red-500/20'
                      : 'border-neutral-300 focus:border-neutral-400 focus:ring-neutral-200'
                    }`}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-inter">Passwords don't match</p>
              )}
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 !rounded-xl mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GlowButton>
          </form>

          <p className="mt-8 text-center text-neutral-500 font-inter text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
