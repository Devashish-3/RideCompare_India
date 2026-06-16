import { RideCompareRequest, RideResult } from '../types/provider';
import { getUberEstimate } from './uberProvider';
import { getOlaEstimate } from './olaProvider';
import { getRapidoEstimate } from './rapidoProvider';

const providerFunctions: Array<(request: RideCompareRequest) => Promise<RideResult[]>> = [
  getUberEstimate,
  getOlaEstimate,
  getRapidoEstimate
];

/**
 * Aggregate provider estimates and sort by fare and ETA.
 */
export async function compareRides(request: RideCompareRequest): Promise<{ results: RideResult[] }> {
  const responses = await Promise.all(
    providerFunctions.map(async (fn) => {
      try {
        return await fn(request);
      } catch (error) {
        console.error('Provider estimate failed', error);
        return [] as RideResult[];
      }
    })
  );

  const flattened = responses.flat();
  const sortedResults = flattened.sort((a: RideResult, b: RideResult) => {
    if (a.fare !== b.fare) return a.fare - b.fare;
    return a.eta_minutes - b.eta_minutes;
  });

  return { results: sortedResults };
}
