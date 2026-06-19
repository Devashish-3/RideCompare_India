import axios from 'axios';

/**
 * Reverse geocode coordinates into a readable place name.
 * Uses the OpenStreetMap Nominatim service for free reverse geocoding.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const endpoint = process.env.REVERSE_GEOCODE_URL || 'https://nominatim.openstreetmap.org/reverse';

  try {
    const response = await axios.get(endpoint, {
      params: {
        format: 'json',
        lat,
        lon: lng,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'RideCompare India MVP - frontend@ridecompare.india',
        Accept: 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;
    const address = data?.address ?? {};
    const parts = [
      address.neighbourhood,
      address.suburb,
      address.village,
      address.town,
      address.city,
      address.district,
      address.county,
      address.state
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.slice(0, 2).join(', ');
    }

    if (typeof data.display_name === 'string') {
      return data.display_name;
    }

    return 'Current Location';
  } catch (err: any) {
    // Log useful details for debugging, but do not leak internal error to client.
    if (err.response) {
      console.error('Reverse geocode provider error:', {
        status: err.response.status,
        data: err.response.data
      });
    } else {
      console.error('Reverse geocode request failed:', err.message || err);
    }

    // Fallback: return a generic label so frontend still displays a name.
    return 'Current Location';
  }
}
