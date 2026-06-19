import type { LocationPoint } from '../types';

interface Props {
  pickup: LocationPoint;
  destinationInput: string;
  onDestinationChange: (value: string) => void;
  destinationSuggestions: LocationPoint[];
  onSuggestionSelect: (suggestion: LocationPoint) => void;
  suggestionLoading: boolean;
  onUseCurrentLocation: () => void;
  locationLoading: boolean;
  locationPermissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  locationError?: string;
  destinationPoint?: LocationPoint | null;
}

/**
 * Modern search interface optimized for ride comparison.
 * Focuses on pickup and destination input with intelligent suggestions.
 */
export function SearchSection({
  pickup,
  destinationInput,
  onDestinationChange,
  destinationSuggestions,
  onSuggestionSelect,
  suggestionLoading,
  onUseCurrentLocation,
  locationLoading,
  locationPermissionStatus,
  locationError,
  destinationPoint
}: Props) {
  const isPickupSet = pickup.lat !== 0 && pickup.lng !== 0;

  return (
    <div className="space-y-3">
      <div className="glass-panel-strong rounded-2xl px-4 py-3 shadow-card transition-all duration-300 hover:border-cyan-500/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400/80">From</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {isPickupSet
                ? (pickup.name && pickup.name !== 'Current Location'
                  ? pickup.name
                  : 'Location detected but Place name unavailable')
                : locationLoading
                ? 'Detecting location...'
                : 'Click the red pin to detect your location'}
            </p>
            {isPickupSet && (
              <p className="mt-0.5 font-mono text-xs text-slate-500">
                {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={locationLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-lg transition-all duration-200 hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:shadow-glow disabled:opacity-50"
          >
            {locationLoading ? '⌛' : '📍'}
          </button>
        </div>
        {locationPermissionStatus === 'denied' && (
          <p className="mt-2 text-xs text-red-400">Location blocked. Enable in settings.</p>
        )}
        {locationError && <p className="mt-2 text-xs text-red-400">{locationError}</p>}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🎯</div>
          <input
            type="text"
            value={destinationInput}
            onChange={(event) => onDestinationChange(event.target.value)}
            placeholder="Where to? (address, maps link, or share link)"
            className="w-full rounded-2xl border border-slate-600/50 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all duration-200 focus:border-cyan-500/50 focus:bg-slate-900/80 focus:shadow-glow"
          />
        </div>

        {destinationSuggestions.length > 0 && (
          <div className="glass-panel-strong overflow-hidden rounded-xl shadow-card">
            {suggestionLoading && (
              <div className="px-4 py-2">
                <p className="text-xs text-slate-400">Searching...</p>
              </div>
            )}
            <div className="max-h-48 space-y-1 overflow-y-auto p-2">
              {destinationSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.lat}-${suggestion.lng}`}
                  type="button"
                  onClick={() => onSuggestionSelect(suggestion)}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-200 transition-all duration-200 hover:border-cyan-500/20 hover:bg-cyan-500/10"
                >
                  <p className="font-medium text-slate-100">{suggestion.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {destinationPoint && (
          <p className="mt-1 font-mono text-xs text-slate-500">
            {destinationPoint.lat.toFixed(4)}, {destinationPoint.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}
