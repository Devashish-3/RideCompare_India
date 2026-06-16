import { useCallback, useEffect, useState } from 'react';
import { reverseGeocode } from '../services/geocode';

type LocationPoint = {
  lat: number;
  lng: number;
  name: string;
};

type LocationState = {
  point?: LocationPoint;
  loading: boolean;
  error?: string;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  requestLocation: () => void;
};

/**
 * Custom hook to request the user's current geographic location.
 * Uses the Permissions API when available and only asks for location when requested.
 */
export function useCurrentLocation(): LocationState {
  const [point, setPoint] = useState<LocationPoint | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  useEffect(() => {
    if (!navigator.permissions) {
      setPermissionStatus('unsupported');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((status) => {
      if (status.state === 'granted') {
        setPermissionStatus('granted');
      } else if (status.state === 'denied') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('prompt');
      }

      status.onchange = () => {
        if (status.state === 'granted') {
          setPermissionStatus('granted');
        } else if (status.state === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
      };
    }).catch(() => {
      setPermissionStatus('unsupported');
    });
  }, []);

  const requestLocation = useCallback(() => {
    setError(undefined);
    setLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      setPermissionStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let name = 'Current Location';

        try {
          name = await reverseGeocode(lat, lng);
        } catch (geocodeError) {
          console.error('Reverse geocode failed', geocodeError);
        }

        setPoint({
          lat,
          lng,
          name
        });
        setLoading(false);
        setError(undefined);
      },
      (positionError) => {
        setLoading(false);
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setPermissionStatus('denied');
          setError('Location permission denied. Please allow location access in your browser settings.');
        } else {
          setError(positionError.message || 'Unable to detect location.');
        }
      },
      { timeout: 20000, maximumAge: 0, enableHighAccuracy: true }
    );
  }, []);

  return {
    point,
    loading,
    error,
    permissionStatus,
    requestLocation
  };
}

