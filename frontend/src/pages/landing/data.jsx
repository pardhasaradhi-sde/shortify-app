import { Zap, BarChart2, Link, Shield, QrCode, Lock } from 'lucide-react';

export const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Sub-10ms Redirects',
    desc: 'Redis-powered caching delivers your links at lightning speed, every time.',
    color: 'bg-orange-50',
    accent: 'text-orange-600',
    border: 'hover:border-orange-300',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Real-time Analytics',
    desc: 'Track clicks, browsers, countries, and daily trends with a beautiful dashboard.',
    color: 'bg-neutral-100',
    accent: 'text-neutral-900',
    border: 'hover:border-neutral-300',
  },
  {
    icon: <Link className="w-6 h-6" />,
    title: 'Custom Aliases',
    desc: 'Create memorable short links like sniply.io/my-brand instead of random codes.',
    color: 'bg-neutral-100',
    accent: 'text-neutral-900',
    border: 'hover:border-neutral-300',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Rate Protected',
    desc: 'Sliding window rate limiting protects your links from abuse and scraping.',
    color: 'bg-neutral-100',
    accent: 'text-neutral-900',
    border: 'hover:border-neutral-300',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'Instant QR Codes',
    desc: 'Download scannable QR codes for any link — perfect for print and offline use.',
    color: 'bg-neutral-100',
    accent: 'text-neutral-900',
    border: 'hover:border-neutral-300',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'JWT Auth & Security',
    desc: 'Your links are private by default. Secured with JWT, BCrypt, and security headers.',
    color: 'bg-neutral-100',
    accent: 'text-neutral-900',
    border: 'hover:border-neutral-300',
  },
];

export const steps = [
  { num: '01', title: 'Paste your URL', desc: 'Drop any long URL into the input field on your dashboard.' },
  { num: '02', title: 'Customize (optional)', desc: 'Add a custom alias to make your link memorable and on-brand.' },
  { num: '03', title: 'Share & track', desc: 'Get your short link instantly. Every click is tracked in real time.' },
];

export const stats = [
  { label: 'Links created', value: 100, suffix: '+' },
  { label: 'Avg. redirect time', value: 8, suffix: 'ms' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
];
