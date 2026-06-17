import axios from 'axios';

const geoClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Reverse geocode coordinates by calling the backend service.
 * Returns a friendly location name for the pickup field.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const response = await geoClient.get<{ name: string }>('/reverse-geocode', {
    params: { lat, lng }
  });
  return response.data.name;
}

/**
 * Forward geocode a typed address to one or more location suggestions.
 */
export async function forwardGeocode(query: string, limit = 5): Promise<Array<{ lat: number; lng: number; name: string }>> {
  // Request results in English and bias results to India by default.
  const response = await geoClient.get<{ suggestions: Array<{ lat: number; lng: number; name: string }>; error?: string }>('/geocode', {
    params: { q: query, limit, language: 'en', country: 'in' }
  });

  if (response.status === 200 && response.data && Array.isArray(response.data.suggestions)) {
    return response.data.suggestions;
  }

  return [];
}
