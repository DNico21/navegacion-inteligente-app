export interface LocationPoint {
  id: string;
  label: string;
  sublabel: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export const SABANA_LOCATIONS: LocationPoint[] = [
  {
    id: 'unisabana',
    label: 'Universidad de La Sabana',
    sublabel: 'Chía, Cundinamarca',
    coordinate: { latitude: 4.8614, longitude: -74.0272 },
  },
  {
    id: 'chia_centro',
    label: 'Chía Centro',
    sublabel: 'Chía, Cundinamarca',
    coordinate: { latitude: 4.8672, longitude: -74.0394 },
  },
  {
    id: 'cajica',
    label: 'Cajicá',
    sublabel: 'Cajicá, Cundinamarca',
    coordinate: { latitude: 4.9182, longitude: -74.0283 },
  },
  {
    id: 'bogota_norte',
    label: 'Bogotá Norte (Calle 170)',
    sublabel: 'Bogotá D.C.',
    coordinate: { latitude: 4.7588, longitude: -74.0565 },
  },
  {
    id: 'bogota_centro',
    label: 'Bogotá Centro',
    sublabel: 'Bogotá D.C.',
    coordinate: { latitude: 4.7110, longitude: -74.0721 },
  },
];

export const DEFAULT_ORIGIN = SABANA_LOCATIONS.find(l => l.id === 'chia_centro')!;
export const DEFAULT_DESTINATION = SABANA_LOCATIONS.find(l => l.id === 'unisabana')!;

export const SABANA_REGION = {
  latitude: 4.865,
  longitude: -74.034,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};
