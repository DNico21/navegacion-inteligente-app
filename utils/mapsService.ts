import { decodePolyline, LatLng } from "./polyline";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";

export interface RouteResult {
  index: number;
  summary: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  durationInTrafficText: string;
  durationInTrafficSeconds: number;
  polylineCoords: LatLng[];
}

export interface PredictedSlot {
  departureTime: Date;
  durationSeconds: number;
  durationText: string;
  label: string;
}

export async function getRoutes(
  origin: LatLng,
  destination: LatLng,
  departureTime: Date = new Date(),
): Promise<RouteResult[]> {
  const params = new URLSearchParams({
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    alternatives: "true",
    traffic_model: "best_guess",
    language: "es",
    key: GOOGLE_MAPS_API_KEY,
    departure_time: Math.floor(departureTime.getTime() / 1000).toString(),
  });

  const response = await fetch(`${DIRECTIONS_URL}?${params}`);
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(
      `Directions API: ${data.status} — ${data.error_message ?? ""}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.routes.map((route: any, index: number): RouteResult => {
    const leg = route.legs[0];
    return {
      index,
      summary: route.summary,
      distanceText: leg.distance.text,
      distanceMeters: leg.distance.value,
      durationText: leg.duration.text,
      durationSeconds: leg.duration.value,
      durationInTrafficText: leg.duration_in_traffic?.text ?? leg.duration.text,
      durationInTrafficSeconds:
        leg.duration_in_traffic?.value ?? leg.duration.value,
      polylineCoords: decodePolyline(route.overview_polyline.points),
    };
  });
}

// Obtiene duraciones para un rango de horarios de salida (para la predicción "mejor hora")
export async function getPredictedSlots(
  origin: LatLng,
  destination: LatLng,
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30,
): Promise<PredictedSlot[]> {
  const now = new Date();
  const times: Date[] = [];

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const t = new Date(now);
      t.setHours(h, m, 0, 0);
      if (t > now) times.push(t);
    }
  }

  const results = await Promise.all(
    times.map(async (time) => {
      const routes = await getRoutes(origin, destination, time);
      const best = routes[0];
      const h = time.getHours();
      const m = time.getMinutes().toString().padStart(2, "0");
      const ampm = h >= 12 ? "pm" : "am";
      return {
        departureTime: time,
        durationSeconds: best.durationInTrafficSeconds,
        durationText: best.durationInTrafficText,
        label: `${h > 12 ? h - 12 : h}:${m} ${ampm}`,
      };
    }),
  );

  return results;
}

// Encuentra el horario óptimo de salida en un rango de horas
export async function getOptimalDeparture(
  origin: LatLng,
  destination: LatLng,
  startHour: number = 5,
  endHour: number = 9,
): Promise<PredictedSlot | null> {
  try {
    const slots = await getPredictedSlots(
      origin,
      destination,
      startHour,
      endHour,
      30,
    );
    if (slots.length === 0) return null;
    return slots.reduce((best, slot) =>
      slot.durationSeconds < best.durationSeconds ? slot : best,
    );
  } catch {
    return null;
  }
}
