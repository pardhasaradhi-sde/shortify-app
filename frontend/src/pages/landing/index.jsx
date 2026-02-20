import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Github, Link2 } from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import GlowButton from '../../components/ui/GlowButton';
import SplitText from '../../components/ui/SplitText';
import Navbar from '../../components/layout/Navbar';
import { features, steps, stats } from './data';

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickShorten = (e) => {
    e.preventDefault();
    navigate('/login', { state: { quickUrl } });
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-neutral-900 overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f6f6f4] to-[#f1f1ef] pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-full mb-8 text-sm font-inter text-neutral-700"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Redis-backed — sub-10ms redirects worldwide
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display leading-[0.95] uppercase mb-6">
            <SplitText text="Shorten." delay={0.1} />
            <span className="text-orange-500"><SplitText text="Track." delay={0.2} /></span>
            <br />
            <SplitText text="Dominate." delay={0.28} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-600 font-inter max-w-2xl mx-auto mb-10 text-balance"
          >
            A professional URL shortener with real-time analytics, custom aliases, QR codes,
            and instant Redis caching. Built for speed. Built for insights.
          </motion.p>

         

          <motion.form
            onSubmit={handleQuickShorten}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-2xl p-2 shadow-sm">
              <div className="pl-2 text-neutral-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="Paste your long URL... press Enter to continue"
                className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none px-1"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors"
              >
                Continue
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-left px-2">
              We’ll validate your session first, then create your short link.
            </p>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-grotesk font-bold text-neutral-900">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-neutral-500 text-sm font-inter mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-grotesk font-bold mb-4">
            Everything you need to <span className="text-orange-500">go faster</span>
          </h2>
          <p className="text-neutral-600 font-inter text-lg max-w-2xl mx-auto">
            Production-grade infrastructure under a clean, minimal API. No bloat. Just features that matter.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className={`rounded-2xl p-6 border border-neutral-200 bg-white transition-all duration-300 ${f.border} hover:shadow-md hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 ${f.accent}`}>
                {f.icon}
              </div>
              <h3 className="font-grotesk font-semibold text-neutral-900 text-lg mb-2">{f.title}</h3>
              <p className="text-neutral-600 font-inter text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-grotesk font-bold mb-4">
            Three steps to <span className="text-orange-500">brilliance</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-neutral-300" />
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl border border-neutral-300 bg-white flex items-center justify-center mx-auto mb-6">
                <span className="font-grotesk font-bold text-2xl text-neutral-900">{step.num}</span>
              </div>
              <h3 className="font-grotesk font-semibold text-neutral-900 text-xl mb-3">{step.title}</h3>
              <p className="text-neutral-600 font-inter text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-3xl p-12 text-center border border-neutral-200 bg-white">
            <h2 className="text-4xl sm:text-5xl font-grotesk font-bold mb-4">
              Ready to go <span className="text-orange-500">faster?</span>
            </h2>
            <p className="text-neutral-600 font-inter text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers and creators shortening links with Shortify.
              Free forever, no credit card required.
            </p>
            <div className="flex justify-center">
              <GlowButton
                size="lg"
                variant="primary"
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 group"
              >
                Start now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlowButton>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-neutral-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/shortify.png" alt="Shortify logo" className="w-6 h-6 object-contain" />
            <span className="font-grotesk font-bold text-neutral-900">Shortify</span>
          </div>
          <p className="text-neutral-500 font-inter text-sm">
            Built with Spring Boot 4 + Redis + React 19
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
