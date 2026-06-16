import type { RideCardData } from '../types';

interface Props {
  rides: RideCardData[];
}

/**
 * Displays top-level comparison insights.
 * Shows cheapest fare, fastest ETA, and best value metrics.
 */
export function ResultsHeader({ rides }: Props) {
  if (rides.length === 0) return null;

  const cheapest = rides.reduce((min, ride) => (ride.fare < min.fare ? ride : min));
  const fastest = rides.reduce((min, ride) => (ride.eta_minutes < min.eta_minutes ? ride : min));
  const savings = Math.max(...rides.map((r) => r.fare)) - cheapest.fare;

  return (
    <div className="glass-panel-strong rounded-2xl p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">💰 Cheapest</p>
          <p className="mt-1 text-lg font-bold text-cyan-300">₹{cheapest.fare}</p>
          <p className="text-xs text-slate-400">{cheapest.provider}</p>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/80">⚡ Fastest</p>
          <p className="mt-1 text-lg font-bold text-violet-300">{fastest.eta_minutes}m</p>
          <p className="text-xs text-slate-400">{fastest.provider}</p>
        </div>

        {savings > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">💵 Save</p>
            <p className="mt-1 text-lg font-bold text-emerald-400">₹{savings}</p>
            <p className="text-xs text-slate-400">vs. most expensive</p>
          </div>
        )}
      </div>
    </div>
  );
}
