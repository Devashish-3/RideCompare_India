export interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
}

export interface DestinationInput {
  label: string;
  point?: LocationPoint;
  source: 'typed' | 'coordinates' | 'link';
}

export interface RideCardData {
  provider: string;
  vehicle: string;
  category: string;
  fare: number;
  eta_minutes: number;
  deep_link: string;
  bestInCategory?: boolean;
}

export interface RideCompareResponse {
  results: RideCardData[];
}
