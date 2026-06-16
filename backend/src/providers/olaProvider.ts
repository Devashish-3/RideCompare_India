import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Ola provider logic.
 * Generates realistic fares and ETA for multiple Ola categories.
 */
export async function getOlaEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceFactor = calculateDistanceFactor(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Ola',
      vehicle: 'Ola Auto',
      category: 'Auto',
      fare: calculateFare(distanceFactor, 80, 160, 0.9),
      eta_minutes: generateEta(3, 7),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Auto')
    },
    {
      provider: 'Ola',
      vehicle: 'Ola Mini',
      category: 'Mini Cab',
      fare: calculateFare(distanceFactor, 110, 290, 1.0),
      eta_minutes: generateEta(4, 10),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Mini')
    },
    {
      provider: 'Ola',
      vehicle: 'Ola Sedan',
      category: 'Sedan',
      fare: calculateFare(distanceFactor, 210, 380, 1.2),
      eta_minutes: generateEta(5, 12),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Sedan')
    }
  ];

  return results;
}

function calculateDistanceFactor(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination']): number {
  const latDiff = Math.abs(pickup.lat - destination.lat);
  const lngDiff = Math.abs(pickup.lng - destination.lng);
  return Math.max(1, latDiff * 105 + lngDiff * 105);
}

function calculateFare(distanceFactor: number, min: number, max: number, multiplier: number): number {
  const range = max - min;
  const base = min + Math.min(range, Math.round(distanceFactor * multiplier * 1.15));
  return Math.max(min, Math.min(max, base));
}

function generateEta(min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(min + Math.random() * (max - min))));
}

function generateOlaDeepLink(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination'], rideType: string): string {
  return `https://ola.app.link/?deep_link_path=ride?source=web&ride_type=${encodeURIComponent(rideType)}&pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}`;
}
