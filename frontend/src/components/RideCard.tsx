import type { RideCardData } from '../types';
import { ProviderLogo, VehicleIcon } from './BrandIcons';

interface Props {
  ride: RideCardData;
  pickupCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number } | undefined;
  cheapestFare?: number;
  maxFare?: number;
}

/**
 * Compact ride comparison card.
 * Optimized for quick comparison and deep-link provider handoff.
 * Displays fare (primary), ETA, vehicle type, and provider branding.
 */
export function RideCard({ ride, pickupCoordinates, destinationCoordinates, cheapestFare, maxFare }: Props) {
  const providerColors: Record<string, { accent: string; button: string; glow: string }> = {
    uber: {
      accent: 'from-slate-700/50 to-slate-800/50 border-slate-500/30',
      button: 'bg-slate-100 text-slate-900 hover:bg-white shadow-slate-400/20',
      glow: 'hover:shadow-slate-500/10'
    },
    ola: {
      accent: 'from-emerald-900/40 to-emerald-950/50 border-emerald-500/30',
      button: 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/30',
      glow: 'hover:shadow-emerald-500/15'
    },
    rapido: {
      accent: 'from-amber-900/40 to-orange-950/50 border-amber-500/30',
      button: 'bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-amber-400/30',
      glow: 'hover:shadow-amber-400/15'
    }
  };

  const providerKey = (ride.provider || '').toLowerCase() as 'uber' | 'ola' | 'rapido';
  const branding = providerColors[providerKey] || providerColors.uber;

  const badges: Array<{ icon: string; label: string }> = [];
  if (ride.bestInCategory) {
    badges.push({ icon: '🏆', label: 'Best in category' });
  }

  const savings = typeof maxFare === 'number' ? Math.max(0, Math.round(maxFare - ride.fare)) : 0;
  const isCheapest = typeof cheapestFare === 'number' && ride.fare === cheapestFare;

  const buildDeepLink = (): string => {
    let link = ride.deep_link;

    if (pickupCoordinates && destinationCoordinates) {
      const params = new URLSearchParams();
      params.set('pickup_lat', pickupCoordinates.lat.toString());
      params.set('pickup_lng', pickupCoordinates.lng.toString());
      params.set('dest_lat', destinationCoordinates.lat.toString());
      params.set('dest_lng', destinationCoordinates.lng.toString());

      const separator = link.includes('?') ? '&' : '?';
      link = `${link}${separator}${params.toString()}`;
    }

    return link;
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3 shadow-card transition-all duration-300 hover:border-cyan-400/30 hover:shadow-glow ${branding.accent} ${branding.glow}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-violet-500/0 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <VehicleIcon type={ride.vehicle} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">{ride.vehicle}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ProviderLogo provider={ride.provider} size="sm" />
              <span className="font-medium text-slate-300">{ride.provider}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-cyan-400/90">{ride.eta_minutes}m</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-right">
            <div className={`text-lg font-bold ${isCheapest ? 'text-cyan-300' : 'text-white'}`}>
              ₹{ride.fare}
            </div>
            {savings > 0 && (
              <div className="text-xs font-medium text-emerald-400">Save ₹{Math.round(savings)}</div>
            )}
          </div>
          <div className="w-28">
            <button
              type="button"
              onClick={() => window.open(buildDeepLink(), '_blank')}
              className={`w-full rounded-xl px-3 py-2 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${branding.button}`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
