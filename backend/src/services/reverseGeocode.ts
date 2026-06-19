// import axios from 'axios';

// /**
//  * Reverse geocode coordinates into a readable place name.
//  * Uses the OpenStreetMap Nominatim service for free reverse geocoding.
//  */
// export async function reverseGeocode(lat: number, lng: number): Promise<string> {
//   const endpoint = process.env.REVERSE_GEOCODE_URL || 'https://nominatim.openstreetmap.org/reverse';

//   try {
//     const response = await axios.get(endpoint, {
//       params: {
//         format: 'json',
//         lat,
//         lon: lng,
//         addressdetails: 1
//       },
//       headers: {
//         'User-Agent': 'RideCompare India MVP - frontend@ridecompare.india',
//         Accept: 'application/json'
//       },
//       timeout: 15000
//     });

//     const data = response.data;
//     const address = data?.address ?? {};
//     const parts = [
//       address.neighbourhood,
//       address.suburb,
//       address.village,
//       address.town,
//       address.city,
//       address.district,
//       address.county,
//       address.state
//     ].filter(Boolean);

//     if (parts.length > 0) {
//       return parts.slice(0, 2).join(', ');
//     }

//     if (typeof data.display_name === 'string') {
//       return data.display_name;
//     }

//     return 'Current Location';
//   } catch (err: any) {
//     // Log useful details for debugging, but do not leak internal error to client.
//     if (err.response) {
//       console.error('Reverse geocode provider error:', {
//         status: err.response.status,
//         data: err.response.data
//       });
//     } else {
//       console.error('Reverse geocode request failed:', err.message || err);
//     }

//     // Fallback: return a generic label so frontend still displays a name.
//     return 'Current Location';
//   }
// }



import axios from 'axios';

/**
 * Cache to reduce repeated Nominatim requests.
 * Helps prevent 429 rate limit errors.
 */
const reverseGeoCache = new Map<string, string>();


async function fetchFromNominatim(lat: number, lng: number) {

  const endpoint =
    process.env.REVERSE_GEOCODE_URL ||
    'https://nominatim.openstreetmap.org/reverse';


  const response = await axios.get(endpoint, {

    params: {
      format: 'json',
      lat,
      lon: lng,
      addressdetails: 1
    },

    headers: {
      'User-Agent':
        'RideCompare India MVP - contact@ridecompare.india',
      Accept: 'application/json'
    },

    timeout: 15000
  });


  return response.data;
}


/**
 * Reverse geocode coordinates into readable place name.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {


  // Round GPS values to avoid duplicate calls
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;


  // Return cached result
  const cached = reverseGeoCache.get(cacheKey);

  if (cached) {
    return cached;
  }


  try {

    let data;


    try {

      // First attempt
      data = await fetchFromNominatim(lat, lng);


    } catch (err: any) {


      // Handle Nominatim rate limit
      if (err.response?.status === 429) {


        console.warn(
          'Nominatim rate limited. Retrying after delay...'
        );


        // wait 3 seconds
        await new Promise(resolve =>
          setTimeout(resolve, 3000)
        );


        // Retry once
        data = await fetchFromNominatim(lat, lng);


      } else {

        throw err;

      }
    }



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



    let placeName = 'Current Location';



    if (parts.length > 0) {

      placeName = parts
        .slice(0, 2)
        .join(', ');

    }

    else if (typeof data?.display_name === 'string') {

      placeName = data.display_name;

    }



    // Save successful result
    reverseGeoCache.set(
      cacheKey,
      placeName
    );


    return placeName;



  } catch (err: any) {


    console.error(
      'Reverse geocode failed:',
      {
        status: err.response?.status,
        message:
          err.response?.data ||
          err.message
      }
    );


    // Better user fallback
    return `Pickup Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  }

}