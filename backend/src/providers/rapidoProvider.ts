import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Rapido provider logic.
 * Generates smaller bike and auto pricing with quick ETAs.
 */
export async function getRapidoEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceFactor = calculateDistanceFactor(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Rapido',
      vehicle: 'Rapido Bike',
      category: 'Bike',
      fare: calculateFare(distanceFactor, 70, 140, 0.85),
      eta_minutes: generateEta(2, 7),
      deep_link: generateRapidoDeepLink(pickup, destination, 'bike')
    },
    {
      provider: 'Rapido',
      vehicle: 'Rapido Auto',
      category: 'Auto',
      fare: calculateFare(distanceFactor, 90, 170, 0.95),
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

function calculateFare(distanceFactor: number, min: number, max: number, multiplier: number): number {
  const range = max - min;
  const base = min + Math.min(range, Math.round(distanceFactor * multiplier * 1.1));
  return Math.max(min, Math.min(max, base));
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
