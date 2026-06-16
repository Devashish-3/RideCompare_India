import type { DestinationInput, LocationPoint } from '../types';

const coordinateRegex = /^\s*([+-]?\d{1,2}\.\d+)\s*,\s*([+-]?\d{1,3}\.\d+)\s*$/;

/**
 * Normalize destination input for the frontend.
 * Supports typed addresses, Google Maps links, WhatsApp shared links, and raw coordinates.
 */
export function parseDestinationInput(input: string): DestinationInput {
  const trimmed = input.trim();

  if (!trimmed) {
    return { label: '', point: undefined, source: 'typed' };
  }

  const url = parseAsUrl(trimmed);
  if (url) {
    const mapsResult = parseGoogleMapsUrl(url);
    if (mapsResult) {
      return mapsResult;
    }

    const whatsappResult = parseWhatsappUrl(url);
    if (whatsappResult) {
      return whatsappResult;
    }
  }

  const coordinateMatch = trimmed.match(coordinateRegex);
  if (coordinateMatch) {
    const lat = Number(coordinateMatch[1]);
    const lng = Number(coordinateMatch[2]);
    return {
      label: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      point: { lat, lng, name: 'Coordinates' },
      source: 'coordinates'
    };
  }

  // Typed addresses and place names are resolved via backend geocoding.
  // This prevents fake coordinate values and ensures destination accuracy.
  return {
    label: trimmed,
    source: 'typed'
  };
}

function parseAsUrl(value: string): URL | null {
  try {
    let normalized = value.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      if (normalized.includes('google.com') || normalized.includes('maps.app.goo.gl') || normalized.includes('goo.gl')) {
        normalized = `https://${normalized}`;
      }
    }
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return new URL(normalized);
    }
  } catch {
    return null;
  }
  return null;
}

function parseGoogleMapsUrl(url: URL): DestinationInput | null {
  if (!url.hostname.includes('google.com') && !url.hostname.includes('goo.gl')) {
    return null;
  }

  const params = url.searchParams;
  const q = params.get('q');
  const plusQuery = q ? q.trim() : null;
  const placeName = plusQuery && !coordinateRegex.test(plusQuery) ? decodeURIComponent(plusQuery) : null;

  const pathMatch = url.pathname.match(/\/maps\/place\/([^\/]+)/i);
  const placeFromPath = pathMatch ? decodeURIComponent(pathMatch[1].replace(/\+/g, ' ')) : null;

  const coordinateMatch = url.href.match(/@([+-]?\d{1,2}\.\d+),([+-]?\d{1,3}\.\d+)/);
  if (coordinateMatch) {
    const lat = Number(coordinateMatch[1]);
    const lng = Number(coordinateMatch[2]);
    const name = placeName || placeFromPath || 'Google Maps location';
    return {
      label: `${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      point: { lat, lng, name },
      source: 'link'
    };
  }

  const resolvedLabel = placeName || placeFromPath;
  if (resolvedLabel) {
    return {
      label: resolvedLabel,
      source: 'link'
    };
  }

  return null;
}

function parseWhatsappUrl(url: URL): DestinationInput | null {
  if (!url.hostname.includes('google.com')) {
    return null;
  }

  const placeName = parseWhatsappPlaceName(url.pathname);
  const coordinateMatch = url.href.match(/@([+-]?\d{1,2}\.\d+),([+-]?\d{1,3}\.\d+)/);

  if (coordinateMatch) {
    const lat = Number(coordinateMatch[1]);
    const lng = Number(coordinateMatch[2]);
    const name = placeName || `Shared location`;
    return {
      label: `${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      point: { lat, lng, name },
      source: 'link'
    };
  }

  if (placeName) {
    return {
      label: placeName,
      source: 'link'
    };
  }

  return null;
}

function parseWhatsappPlaceName(pathname: string): string | null {
  const pathMatch = pathname.match(/\/place\/([^\/]+)\/(@|data=|$)/i);
  if (pathMatch) {
    return decodeURIComponent(pathMatch[1].replace(/\+/g, ' '));
  }

  return null;
}

/**
 * Builds a valid destination point for API use.
 * Returns resolved coordinates when available, or a safe fallback point.
 */
export function buildDestinationPoint(dest: DestinationInput): LocationPoint {
  if (dest.point) {
    return dest.point;
  }

  return { lat: 0, lng: 0, name: dest.label };
}

