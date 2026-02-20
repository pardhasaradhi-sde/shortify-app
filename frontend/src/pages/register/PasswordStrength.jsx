import { CheckCircle } from 'lucide-react';

export default function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special char', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColors = ['bg-neutral-400', 'bg-neutral-500', 'bg-neutral-700', 'bg-orange-500'];

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? barColors[score - 1] : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-xs font-inter transition-colors ${
              c.ok ? 'text-neutral-700' : 'text-neutral-400'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
