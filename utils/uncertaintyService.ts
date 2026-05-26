import { LatLng } from './polyline';
import { getRoutes } from './mapsService';

export interface UncertaintyResult {
  meanSeconds: number;
  stdDevSeconds: number;
  marginMinutes: number;
  reliabilityColor: string;
  reliabilityEmoji: string;
  label: string; // e.g. "58 min ± 8 min 🟢"
}

// Samples the route at 6 departure times (spaced 30 min apart, starting now+5 min)
// and computes mean ± std-dev to simulate historical traffic variance.
export async function computeUncertainty(
  origin: LatLng,
  destination: LatLng,
): Promise<UncertaintyResult> {
  const now = Date.now();
  const offsets = [5, 35, 65, 95, 125, 155]; // minutes from now

  const settled = await Promise.allSettled(
    offsets.map(async (minutesOffset) => {
      const depTime = new Date(now + minutesOffset * 60 * 1000);
      const routes = await getRoutes(origin, destination, depTime);
      return routes[0]?.durationInTrafficSeconds ?? null;
    }),
  );

  const samples: number[] = settled
    .filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);

  if (samples.length === 0) {
    return {
      meanSeconds: 0,
      stdDevSeconds: 0,
      marginMinutes: 0,
      reliabilityColor: '#2D751A',
      reliabilityEmoji: '🟢',
      label: '— min',
    };
  }

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  const marginMinutes = Math.max(1, Math.ceil(stdDev / 60));
  const meanMinutes = Math.round(mean / 60);

  let reliabilityColor: string;
  let reliabilityEmoji: string;
  if (marginMinutes < 10) {
    reliabilityColor = '#2D751A';
    reliabilityEmoji = '🟢';
  } else if (marginMinutes < 20) {
    reliabilityColor = '#8F5A12';
    reliabilityEmoji = '🟡';
  } else {
    reliabilityColor = '#B03A39';
    reliabilityEmoji = '🔴';
  }

  return {
    meanSeconds: mean,
    stdDevSeconds: stdDev,
    marginMinutes,
    reliabilityColor,
    reliabilityEmoji,
    label: `${meanMinutes} min ± ${marginMinutes} min ${reliabilityEmoji}`,
  };
}
