import { RideCompareRequest, RideResult } from '../types/provider';

/**
 * Mock Ola provider logic.
 * Generates realistic fares and ETA for multiple Ola categories.
 */
export async function getOlaEstimate(request: RideCompareRequest): Promise<RideResult[]> {
  const { pickup, destination } = request;
  const distanceKm = calculateDistanceKm(pickup, destination);

  const results: RideResult[] = [
    {
      provider: 'Ola',
      vehicle: 'Ola Auto',
      category: 'Auto',
      // per-km rate ~ 0.9
      fare: calculateFare(distanceKm, 80, 160, 0.9),
      eta_minutes: generateEta(3, 7),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Auto')
    },
    {
      provider: 'Ola',
      vehicle: 'Ola Mini',
      category: 'Mini Cab',
      fare: calculateFare(distanceKm, 110, 290, 1.0),
      eta_minutes: generateEta(4, 10),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Mini')
    },
    {
      provider: 'Ola',
      vehicle: 'Ola Sedan',
      category: 'Sedan',
      fare: calculateFare(distanceKm, 210, 380, 1.2),
      eta_minutes: generateEta(5, 12),
      deep_link: generateOlaDeepLink(pickup, destination, 'Ola Sedan')
    }
  ];

  return results;
}

function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateDistanceKm(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination']): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(destination.lat - pickup.lat);
  const dLon = toRadians(destination.lng - pickup.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pickup.lat)) * Math.cos(toRadians(destination.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(0.1, distance); // minimum 0.1 km
}

function calculateFare(distanceKm: number, min: number, max: number, perKmRate: number): number {
  // Fare = min + distanceKm * perKmRate, rounded to nearest integer
  const computed = min + Math.round(distanceKm * perKmRate);
  return Math.max(min, computed);
}

function generateEta(min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(min + Math.random() * (max - min))));
}

function generateOlaDeepLink(pickup: RideCompareRequest['pickup'], destination: RideCompareRequest['destination'], rideType: string): string {
  return `https://ola.app.link/?deep_link_path=ride?source=web&ride_type=${encodeURIComponent(rideType)}&pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}`;
}
