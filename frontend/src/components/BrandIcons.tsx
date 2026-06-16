import type { ReactNode } from 'react';

const stroke = {
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ProviderLogo({ provider, className = '', size = 'md' }: { provider: string; className?: string; size?: 'sm' | 'md' }) {
  const key = provider.toLowerCase();
  const box = size === 'sm' ? 'h-6 w-6 rounded-md' : 'h-10 w-10 rounded-xl';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-6 w-6';

  if (key === 'uber') {
    return (
      <div className={`flex items-center justify-center bg-black shadow-lg shadow-black/40 ${box} ${className}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <text x="12" y="17" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
            U
          </text>
        </svg>
      </div>
    );
  }

  if (key === 'ola') {
    return (
      <div className={`flex items-center justify-center bg-[#1a7f37] shadow-lg shadow-emerald-500/30 ${box} ${className}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#ffffff" strokeWidth="2" />
          <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
            O
          </text>
        </svg>
      </div>
    );
  }

  if (key === 'rapido') {
    return (
      <div className={`flex items-center justify-center bg-[#f7b500] shadow-lg shadow-amber-400/30 ${box} ${className}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path d="M7 17l2-6h6l2 6" fill="none" stroke="#1a1a1a" {...stroke} />
          <circle cx="8" cy="17" r="2" fill="#1a1a1a" />
          <circle cx="16" cy="17" r="2" fill="#1a1a1a" />
          <path d="M9 11l3-4 3 4" fill="none" stroke="#1a1a1a" {...stroke} />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-700 text-sm font-bold text-white ${box} ${className}`}>
      {provider.charAt(0).toUpperCase()}
    </div>
  );
}

export function VehicleIcon({ type, className = '' }: { type: string; className?: string }) {
  const t = type.toLowerCase();

  const wrap = (children: ReactNode, gradient: string) => (
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-inner ${className}`}>
      {children}
    </div>
  );

  if (t.includes('bike') || t.includes('motor') || t.includes('two')) {
    return wrap(
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <circle cx="6" cy="17" r="2.5" fill="#ecfeff" stroke="#06b6d4" {...stroke} />
        <circle cx="18" cy="17" r="2.5" fill="#ecfeff" stroke="#06b6d4" {...stroke} />
        <path d="M6 17h3l2-5h5l2 5" fill="none" stroke="#ecfeff" {...stroke} />
        <path d="M11 12l2-4h3" fill="none" stroke="#ecfeff" {...stroke} />
        <circle cx="16" cy="8" r="1.5" fill="#ecfeff" />
      </svg>,
      'from-cyan-500/80 to-teal-600/80 ring-1 ring-cyan-300/40'
    );
  }

  if (t.includes('auto') || t.includes('rickshaw')) {
    return wrap(
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M4 13c1.5-3 4-5 8-5s6.5 2 8 5" fill="#fef9c3" stroke="#facc15" {...stroke} />
        <rect x="3" y="13" width="18" height="4" rx="1" fill="#fef9c3" stroke="#facc15" {...stroke} />
        <circle cx="7" cy="18" r="1.5" fill="#fef9c3" stroke="#facc15" {...stroke} />
        <circle cx="17" cy="18" r="1.5" fill="#fef9c3" stroke="#facc15" {...stroke} />
        <path d="M12 8v5" stroke="#facc15" {...stroke} />
      </svg>,
      'from-amber-400/80 to-yellow-500/80 ring-1 ring-amber-200/40'
    );
  }

  if (t.includes('suv')) {
    return wrap(
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="8" width="20" height="8" rx="2" fill="#ede9fe" stroke="#a78bfa" {...stroke} />
        <path d="M5 11h14" stroke="#a78bfa" {...stroke} />
        <circle cx="7" cy="17" r="1.5" fill="#ede9fe" stroke="#a78bfa" {...stroke} />
        <circle cx="17" cy="17" r="1.5" fill="#ede9fe" stroke="#a78bfa" {...stroke} />
      </svg>,
      'from-violet-500/80 to-purple-600/80 ring-1 ring-violet-300/40'
    );
  }

  if (t.includes('premium') || t.includes('xl') || t.includes('prime') || t.includes('premier')) {
    return wrap(
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="7" width="20" height="9" rx="2" fill="#fef3c7" stroke="#f59e0b" {...stroke} />
        <path d="M7 10h10" stroke="#f59e0b" {...stroke} />
        <circle cx="7" cy="17" r="1.5" fill="#fef3c7" stroke="#f59e0b" {...stroke} />
        <circle cx="17" cy="17" r="1.5" fill="#fef3c7" stroke="#f59e0b" {...stroke} />
        <path d="M12 4l1 3h-2l1-3z" fill="#f59e0b" />
      </svg>,
      'from-amber-500/80 to-orange-500/80 ring-1 ring-amber-300/40'
    );
  }

  if (t.includes('sedan') || t.includes('mini') || t.includes('cab') || t.includes('go')) {
    return wrap(
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="9" width="18" height="6" rx="1.5" fill="#dbeafe" stroke="#3b82f6" {...stroke} />
        <path d="M6 9l2-3h8l2 3" fill="#dbeafe" stroke="#3b82f6" {...stroke} />
        <circle cx="7" cy="16" r="1.5" fill="#dbeafe" stroke="#3b82f6" {...stroke} />
        <circle cx="17" cy="16" r="1.5" fill="#dbeafe" stroke="#3b82f6" {...stroke} />
      </svg>,
      'from-blue-500/80 to-indigo-600/80 ring-1 ring-blue-300/40'
    );
  }

  return wrap(
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <rect x="3" y="8" width="18" height="7" rx="2" fill="#e2e8f0" stroke="#94a3b8" {...stroke} />
      <circle cx="7" cy="16" r="1.5" fill="#e2e8f0" stroke="#94a3b8" {...stroke} />
      <circle cx="17" cy="16" r="1.5" fill="#e2e8f0" stroke="#94a3b8" {...stroke} />
    </svg>,
    'from-slate-500/80 to-slate-600/80 ring-1 ring-slate-300/30'
  );
}
