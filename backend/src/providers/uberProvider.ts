import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Uber provider logic.
 * Generates a realistic fare and ETA for Uber based on pickup/destination.
 */
export async function getUberEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceKm = calculateDistanceKm(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Uber',
      vehicle: 'Uber Go',
      category: 'Mini Cab',
      fare: calculateFare(distanceKm, 120, 260, 0.95),
      eta_minutes: generateEta(3, 8),
      deep_link: generateUberDeepLink(pickup, destination, 'Uber Go')
    },
    {
      provider: 'Uber',
      vehicle: 'Uber Premier',
      category: 'Premium/Luxury',
      fare: calculateFare(distanceKm, 250, 420, 1.1),
      eta_minutes: generateEta(5, 12),
      deep_link: generateUberDeepLink(pickup, destination, 'Uber Premier')
    }
  ];

  return results;
}

function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateDistanceKm(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination']): number {
  const R = 6371;
  const dLat = toRadians(destination.lat - pickup.lat);
  const dLon = toRadians(destination.lng - pickup.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pickup.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(0.1, distance);
}

function calculateFare(distanceKm: number, min: number, max: number, perKmRate: number): number {
  const computed = min + Math.round(distanceKm * perKmRate);
  return Math.max(min, computed);
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
