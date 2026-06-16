import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Uber provider logic.
 * Generates a realistic fare and ETA for Uber based on pickup/destination.
 */
export async function getUberEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceFactor = calculateDistanceFactor(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Uber',
      vehicle: 'Uber Go',
      category: 'Mini Cab',
      fare: calculateFare(distanceFactor, 120, 260, 0.95),
      eta_minutes: generateEta(3, 8),
      deep_link: generateUberDeepLink(pickup, destination, 'Uber Go')
    },
    {
      provider: 'Uber',
      vehicle: 'Uber Premier',
      category: 'Premium/Luxury',
      fare: calculateFare(distanceFactor, 250, 420, 1.1),
      eta_minutes: generateEta(5, 12),
      deep_link: generateUberDeepLink(pickup, destination, 'Uber Premier')
    }
  ];

  return results;
}

function calculateDistanceFactor(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination']): number {
  const latDiff = Math.abs(pickup.lat - destination.lat);
  const lngDiff = Math.abs(pickup.lng - destination.lng);
  return Math.max(1, latDiff * 100 + lngDiff * 100);
}

function calculateFare(distanceFactor: number, min: number, max: number, multiplier: number): number {
  const range = max - min;
  const base = min + Math.min(range, Math.round(distanceFactor * multiplier * 1.2));
  return Math.max(min, Math.min(max, base));
}

function generateEta(min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(min + Math.random() * (max - min))));
}

function generateUberDeepLink(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination'], vehicleName: string): string {
  const params = new URLSearchParams({
    action: 'setPickup',
    'pickup[latitude]': String(pickup.lat),
    'pickup[longitude]': String(pickup.lng),
    'pickup[nickname]': pickup.name,
    'dropoff[latitude]': String(destination.lat),
    'dropoff[longitude]': String(destination.lng),
    'dropoff[nickname]': destination.name,
    'product': vehicleName
  });

  return `https://m.uber.com/ul/?${params.toString()}`;
}
