import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Rapido provider logic.
 * Generates smaller bike and auto pricing with quick ETAs.
 */
export async function getRapidoEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceKm = calculateDistanceKm(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Rapido',
      vehicle: 'Rapido Bike',
      category: 'Bike',
      fare: calculateFare(distanceKm, 70, 140, 0.85),
      eta_minutes: generateEta(2, 7),
      deep_link: generateRapidoDeepLink(pickup, destination, 'bike')
    },
    {
      provider: 'Rapido',
      vehicle: 'Rapido Auto',
      category: 'Auto',
      fare: calculateFare(distanceKm, 90, 170, 0.95),
      eta_minutes: generateEta(3, 8),
      deep_link: generateRapidoDeepLink(pickup, destination, 'auto')
    }
  ];

  return results;
}

function calculateDistanceFactor(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination']): number {
  const latDiff = Math.abs(pickup.lat - destination.lat);
  const lngDiff = Math.abs(pickup.lng - destination.lng);
  return Math.max(1, latDiff * 95 + lngDiff * 95);
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

function generateRapidoDeepLink(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination'], mode: string): string {
  const params = new URLSearchParams({
    pickup_lat: String(pickup.lat),
    pickup_lng: String(pickup.lng),
    drop_lat: String(destination.lat),
    drop_lng: String(destination.lng),
    mode
  });

  return `https://www.rapido.com/book?${params.toString()}`;
}
