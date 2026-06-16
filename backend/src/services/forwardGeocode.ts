import axios from 'axios';
import { getCached, setCached, initCache } from './geocodeCache';

// initialize cache on module load
initCache().catch(() => {});

type ForwardGeocodeResult = { lat: number; lon: number; display_name: string };

type ForwardGeocodeOptions = {
  country?: string; // ISO country code(s), comma-separated
  language?: string; // preferred language (e.g. 'en')
};

/**
 * Forward geocode a query string to coordinates and one or more display names.
 * Uses OpenStreetMap Nominatim search API for free geocoding.
 */
export async function forwardGeocode(query: string, limit = 5, opts?: ForwardGeocodeOptions): Promise<ForwardGeocodeResult[]> {
  const cacheKey = `${query.trim().toLowerCase()}|lang=${opts?.language || 'en'}|country=${opts?.country || ''}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached.results;
  }

  const endpoint = process.env.FORWARD_GEOCODE_URL || 'https://nominatim.openstreetmap.org/search';

  const params: any = {
    q: query,
    format: 'json',
    addressdetails: 1,
    limit
  };

  if (opts?.country) {
    // Nominatim uses 'countrycodes' param (comma-separated ISO codes)
    params.countrycodes = opts.country;
  }

  const headers: any = {
    'User-Agent': 'RideCompare India MVP - backend',
    Accept: 'application/json'
  };

  if (opts?.language) {
    headers['Accept-Language'] = opts.language;
  } else {
    // default to English to favor English-language display names
    headers['Accept-Language'] = 'en';
  }

  const response = await axios.get(endpoint, {
    params,
    headers,
    timeout: 15000
  });

  const data = response.data;
  if (Array.isArray(data) && data.length > 0) {
    const results = data.slice(0, limit).map((item: any) => ({
      lat: Number(item.lat),
      lon: Number(item.lon),
      display_name: item.display_name
    }));
    try {
      await setCached(cacheKey, results);
    } catch {
      // ignore cache failures
    }
    return results;
  }

  return [];
}
