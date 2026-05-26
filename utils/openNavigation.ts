import { Linking, Platform } from 'react-native';

interface Coords {
  latitude: number;
  longitude: number;
}

export async function openNavigation(destination: Coords, label: string) {
  const { latitude: lat, longitude: lng } = destination;

  if (Platform.OS === 'android') {
    // En Android el esquema geo: dispara el selector nativo del sistema
    // con todas las apps de navegación instaladas (Maps, Waze, etc.)
    await Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`);
  } else {
    // En iOS abre Apple Maps; si el usuario tiene Google Maps como default lo usará
    await Linking.openURL(`maps://?daddr=${lat},${lng}`);
  }
}
