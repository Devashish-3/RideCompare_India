import { useState } from 'react';

interface Props {
  onChange: (filter: string | null) => void;
}

const CHIPS = [
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'bike', label: 'Bike' },
  { key: 'auto', label: 'Auto' },
  { key: 'cab', label: 'Cab' }
];

export function FilterChips({ onChange }: Props) {
  const [active, setActive] = useState<string | null>(null);

  function toggle(key: string) {
    const next = active === key ? null : key;
    setActive(next);
    onChange(next);
  }

  return (
    <div className="flex gap-2 overflow-auto pb-1">
      {CHIPS.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => toggle(c.key)}
          className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
            active === c.key
              ? 'border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-200 shadow-glow'
              : 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500/50 hover:text-slate-200'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
