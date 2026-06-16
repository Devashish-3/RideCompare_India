import { useEffect, useMemo, useState } from 'react';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import { parseDestinationInput } from './utils/destinationParser';
import { compareRides } from './services/api';
import { reverseGeocode, forwardGeocode } from './services/geocode';
import { SearchSection } from './components/SearchSection';
import { ResultsHeader } from './components/ResultsHeader';
import { RideCard } from './components/RideCard';
import { SkeletonLoader } from './components/SkeletonLoader';
import { FilterChips } from './components/FilterChips';
import type { LocationPoint, RideCardData, RideCompareResponse } from './types';

const initialPickup: LocationPoint = {
  lat: 0,
  lng: 0,
  name: 'Current Location'
};

/**
 * RideCompare India: Fast ride comparison platform.
 * Compare fares across Uber, Ola & Rapido and open the provider app instantly.
 */
function App() {
  const locationState = useCurrentLocation();
  const [pickup, setPickup] = useState<LocationPoint>(initialPickup);
  const [destinationInput, setDestinationInput] = useState('');
  const [destinationPoint, setDestinationPoint] = useState<LocationPoint | null>(null);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Array<LocationPoint>>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [rides, setRides] = useState<RideCardData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (locationState.point) {
      setPickup(locationState.point);
    }
  }, [locationState.point]);

  const parsedDestination = useMemo(() => parseDestinationInput(destinationInput), [destinationInput]);

  useEffect(() => {
    if (parsedDestination.label) {
      if (parsedDestination.point) {
        setDestinationPoint(parsedDestination.point);
      } else {
        setDestinationPoint(null);
      }
    }
  }, [parsedDestination]);

  useEffect(() => {
    let isCurrent = true;
    const query = parsedDestination.point ? '' : parsedDestination.label;
    const shouldFetch = query.trim().length > 2 && (parsedDestination.source === 'typed' || parsedDestination.source === 'link');

    if (shouldFetch) {
      setSuggestionLoading(true);
      setDestinationSuggestions([]);

      const timeout = window.setTimeout(() => {
        forwardGeocode(query, 5)
          .then((results) => {
            if (!isCurrent) return;
            const suggestions = results
              .filter((item) => item.name.trim().toLowerCase() !== query.trim().toLowerCase())
              .slice(0, 5)
              .map((item) => ({ lat: item.lat, lng: item.lng, name: item.name }));
            setDestinationSuggestions(suggestions);
          })
          .catch(() => {
            if (isCurrent) setDestinationSuggestions([]);
          })
          .finally(() => {
            if (isCurrent) setSuggestionLoading(false);
          });
      }, 400);

      return () => {
        isCurrent = false;
        window.clearTimeout(timeout);
      };
    }

    setDestinationSuggestions([]);
    setSuggestionLoading(false);
    return () => {
      isCurrent = false;
    };
  }, [destinationInput, parsedDestination.source, parsedDestination.label, parsedDestination.point]);

  async function resolveDestinationFromLabel(label: string): Promise<LocationPoint | null> {
    try {
      const results = await forwardGeocode(label, 1);
      if (results.length === 0) {
        return null;
      }

      return { lat: results[0].lat, lng: results[0].lng, name: results[0].name };
    } catch (resolveError) {
      console.error('Destination geocode failed', resolveError);
      return null;
    }
  }

  async function handleCompare() {
    setError('');

    if (!pickup.lat || !pickup.lng) {
      setError('Please allow location permission or enter a valid pickup location.');
      return;
    }

    if (!destinationInput) {
      setError('Destination is required.');
      return;
    }

    let destination = destinationPoint;
    if (!destination) {
      const label = parsedDestination.label.trim();
      if (!label) {
        setError('Please enter a destination as an address or supported link.');
        return;
      }

      const resolved = await resolveDestinationFromLabel(label);
      if (!resolved) {
        setError('Unable to resolve the destination. Please enter a full address or select a suggestion.');
        return;
      }

      destination = resolved;
      setDestinationPoint(resolved);
    }

    setLoading(true);

    try {
      const results = await compareRides(pickup, destination);
      setRides(results.results);
    } catch (apiError) {
      console.error('Compare request failed', apiError);
      setError('Unable to fetch comparison results. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  function handleUseCurrentLocation() {
    setError('');
    locationState.requestLocation();
  }

  function handleSuggestionSelect(suggestion: LocationPoint) {
    setDestinationInput(suggestion.name);
    setDestinationPoint(suggestion);
    setDestinationSuggestions([]);
  }

  return (
    <div className="futuristic-bg futuristic-grid min-h-screen px-4 pb-6 pt-4 text-slate-100">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="relative">
          <div className="absolute -left-2 -top-2 h-16 w-16 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="absolute -right-2 top-4 h-12 w-12 rounded-full bg-violet-500/10 blur-2xl" />
          <h1 className="relative font-display text-2xl font-bold tracking-tight">
            <span className="neon-text">Compare Rides</span>
          </h1>
          <p className="relative mt-1 text-sm text-slate-400">
            Find the cheapest ride in seconds
          </p>
        </div>

        {/* Search Section */}
        <SearchSection
          pickup={pickup}
          destinationInput={destinationInput}
          onDestinationChange={setDestinationInput}
          destinationSuggestions={destinationSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
          suggestionLoading={suggestionLoading}
          onUseCurrentLocation={handleUseCurrentLocation}
          locationLoading={locationState.loading}
          locationPermissionStatus={locationState.permissionStatus}
          locationError={locationState.error}
          destinationPoint={destinationPoint}
        />

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Compare Button */}
        <button
          type="button"
          onClick={handleCompare}
          disabled={loading || !pickup.lat || !pickup.lng || !destinationInput}
          className="neon-button w-full rounded-xl px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? 'Comparing rides...' : 'Compare Fares'}
        </button>

        {/* Results Section */}
        {rides.length > 0 || loading ? (
          <div className="space-y-4">
            {rides.length > 0 && <ResultsHeader rides={rides} />}

            <div>
              <FilterChips onChange={setActiveFilter} />
            </div>

            {loading ? (
              <SkeletonLoader />
            ) : (
              <div className="space-y-2">
                {(() => {
                  // client-side filtering/sorting
                  let displayed = [...rides];
                  if (activeFilter === 'cheapest') {
                    displayed = displayed.sort((a, b) => a.fare - b.fare);
                  } else if (activeFilter === 'fastest') {
                    displayed = displayed.sort((a, b) => a.eta_minutes - b.eta_minutes);
                  } else if (activeFilter === 'bike') {
                    displayed = displayed.filter((r) => r.vehicle.toLowerCase().includes('bike'));
                  } else if (activeFilter === 'auto') {
                    displayed = displayed.filter((r) => r.vehicle.toLowerCase().includes('auto'));
                  } else if (activeFilter === 'cab') {
                    displayed = displayed.filter((r) => r.vehicle.toLowerCase().includes('cab') || r.vehicle.toLowerCase().includes('mini') || r.vehicle.toLowerCase().includes('sedan'));
                  }

                  const fares = displayed.map((r) => r.fare);
                  const maxFare = fares.length ? Math.max(...fares) : undefined;
                  const cheapestFare = fares.length ? Math.min(...fares) : undefined;

                  return displayed.map((ride) => (
                    <RideCard
                      key={`${ride.provider}-${ride.vehicle}`}
                      ride={ride}
                      pickupCoordinates={pickup}
                      destinationCoordinates={destinationPoint || undefined}
                      cheapestFare={cheapestFare}
                      maxFare={maxFare}
                    />
                  ));
                })()}
              </div>
            )}
          </div>
        ) : null}

        {/* Empty State Message */}
        {!loading && rides.length === 0 && destinationInput && (
          <div className="glass-panel rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-slate-400">
              Enter your destination and tap "Compare Fares" to see available rides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

