export interface RideRequestPoint {
  lat: number;
  lng: number;
  name: string;
}

export interface RideCompareRequest {
  pickup: RideRequestPoint;
  destination: RideRequestPoint;
}

export interface RideResult {
  provider: string;
  vehicle: string;
  category: string;
  fare: number;
  eta_minutes: number;
  deep_link: string;
}

export interface ProviderConfig {
  enabled: boolean;
}
