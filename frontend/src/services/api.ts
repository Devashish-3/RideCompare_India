import axios from 'axios';
import type { LocationPoint, RideCompareResponse } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Sends pickup and destination information to the compare API.
 * Returns sorted provider results.
 */
export async function compareRides(pickup: LocationPoint, destination: LocationPoint): Promise<RideCompareResponse> {
  const response = await apiClient.post<RideCompareResponse>('/compare', {
    pickup,
    destination
  });
  return response.data;
}
