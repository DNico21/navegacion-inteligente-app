import { useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RouteContext } from '@/context/RouteContext/RouteContext';
import { SABANA_REGION } from '@/constants/locations';
import { openNavigation } from '@/utils/openNavigation';
import BottomNavBar from '@/components/BottomNavBar';

const WELLBEING = [
  { icon: 'headset', title: 'Escuchar Lo-Fi Relax', subtitle: 'Música binaural para concentración' },
  { icon: 'air', title: 'Respiración rápida', subtitle: 'Técnica 4-7-8 para calmar nervios' },
  { icon: 'auto-awesome', title: 'Afirmación de calma', subtitle: 'Enfoque mental positivo hoy' },
];

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

function trafficStress(durationSecs: number, baseSecs: number): { level: string; percent: number; color: string } {
  const ratio = durationSecs / baseSecs;
  if (ratio < 1.15) return { level: 'Bajo', percent: 0.25, color: '#2D751A' };
  if (ratio < 1.4) return { level: 'Medio', percent: 0.55, color: '#8F5A12' };
  return { level: 'Alto', percent: 0.85, color: '#B03A39' };
}

export default function RouteDetailScreen() {
  const { selectedRoute, state } = useContext(RouteContext);
  const route = selectedRoute;

  const handleStartNavigation = useCallback(() => {
    openNavigation(state.destination.coordinate, state.destination.label);
  }, [state.destination]);
  const stress = route
    ? trafficStress(route.durationInTrafficSeconds, route.durationSeconds)
    : { level: 'Medio', percent: 0.65, color: '#8F5A12' };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de la Ruta</Text>
        </View>
        <TouchableOpacity hitSlop={8}>
          <MaterialIcons name="share" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View style={styles.mapBox}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={SABANA_REGION}
            region={route && route.polylineCoords.length > 0 ? {
              latitude: (state.origin.coordinate.latitude + state.destination.coordinate.latitude) / 2,
              longitude: (state.origin.coordinate.longitude + state.destination.coordinate.longitude) / 2,
              latitudeDelta: Math.abs(state.origin.coordinate.latitude - state.destination.coordinate.latitude) + 0.05,
              longitudeDelta: Math.abs(state.origin.coordinate.longitude - state.destination.coordinate.longitude) + 0.05,
            } : SABANA_REGION}
          >
            {route && route.polylineCoords.length > 0 && (
              <>
                <Polyline
                  coordinates={route.polylineCoords}
                  strokeColor="#185FA5"
                  strokeWidth={4}
                />
                <Marker
                  coordinate={state.origin.coordinate}
                  title={state.origin.label}
                  pinColor="#2D751A"
                />
                <Marker
                  coordinate={state.destination.coordinate}
                  title={state.destination.label}
                  pinColor="#185FA5"
                />
              </>
            )}
          </MapView>
          <View style={styles.mapPill}>
            <MaterialIcons name="my-location" size={13} color="#1960a6" />
            <Text style={styles.mapPillText}>En tiempo real</Text>
          </View>
        </View>

        {/* Route card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardTop}>
            <View style={styles.routeCardTopLeft}>
              <Text style={styles.routeName}>
                {route?.summary ?? 'Cargando ruta...'}
              </Text>
              <Text style={styles.routeDesc}>
                {state.origin.label} → {state.destination.label}
              </Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{route?.distanceText ?? '— km'}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CON TRÁFICO</Text>
              {route ? (
                <Text style={styles.statValuePrimary}>
                  {formatMinutes(route.durationInTrafficSeconds)}
                </Text>
              ) : (
                <ActivityIndicator color="#1b3a6b" />
              )}
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SIN TRÁFICO</Text>
              {route ? (
                <Text style={styles.statValueSecondary}>
                  {formatMinutes(route.durationSeconds)}
                </Text>
              ) : (
                <ActivityIndicator color="#1960a6" />
              )}
            </View>
          </View>
        </View>

        {/* Stress analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={22} color="#1960a6" />
            <Text style={styles.sectionTitle}>Análisis de Estrés de Tráfico</Text>
          </View>
          <View style={[styles.stressCard, { borderLeftColor: stress.color }]}>
            <View style={styles.stressCardTop}>
              <View style={styles.stressIconCircle}>
                <MaterialIcons name="speed" size={24} color={stress.color} />
              </View>
              <View>
                <Text style={[styles.stressLevel, { color: stress.color }]}>
                  Nivel detectado: {stress.level}
                </Text>
                <Text style={[styles.stressDetail, { color: stress.color }]}>
                  {route
                    ? `+${Math.round((route.durationInTrafficSeconds - route.durationSeconds) / 60)} min sobre el tiempo base`
                    : 'Calculando...'}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stress.percent * 100}%`, backgroundColor: stress.color }]} />
            </View>
          </View>
        </View>

        {/* Wellbeing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sugerencias de Bienestar</Text>
          <View style={styles.wellbeingList}>
            {WELLBEING.map(item => (
              <TouchableOpacity key={item.title} style={styles.wellbeingCard} activeOpacity={0.8}>
                <View style={styles.wellbeingIconBox}>
                  <MaterialIcons name={item.icon as any} size={22} color="#44474f" />
                </View>
                <View style={styles.wellbeingText}>
                  <Text style={styles.wellbeingTitle}>{item.title}</Text>
                  <Text style={styles.wellbeingSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c4c6d0" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.88} onPress={handleStartNavigation}>
          <MaterialIcons name="navigation" size={22} color="#fff" />
          <Text style={styles.ctaText}>Iniciar Navegación</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56, backgroundColor: '#F4F6F8',
    borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTitle: { fontWeight: '600', fontSize: 16, color: '#1B3A6B', letterSpacing: -0.2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 24 },
  mapBox: {
    height: 220, borderRadius: 12, borderWidth: 1, borderColor: '#C5CDD8',
    overflow: 'hidden', backgroundColor: '#d8dadc',
  },
  mapPill: {
    position: 'absolute', bottom: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: '#c4c6d0',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999,
  },
  mapPillText: { fontWeight: '500', fontSize: 11, color: '#1960a6', letterSpacing: 0.5 },
  routeCard: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#C5CDD8', padding: 16, gap: 16,
  },
  routeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  routeCardTopLeft: { flex: 1, gap: 4 },
  routeName: { fontWeight: '600', fontSize: 18, lineHeight: 24, letterSpacing: -0.2, color: '#1b3a6b' },
  routeDesc: { fontWeight: '400', fontSize: 14, lineHeight: 20, color: '#44474f' },
  confidenceBadge: { backgroundColor: '#EBF5E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999, flexShrink: 0 },
  confidenceText: { fontWeight: '600', fontSize: 12, color: '#2D751A' },
  statsGrid: { flexDirection: 'row', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f2f4f6' },
  statItem: { flex: 1, gap: 2 },
  statLabel: { fontWeight: '500', fontSize: 11, letterSpacing: 0.8, color: '#747780', textTransform: 'uppercase' },
  statValuePrimary: { fontWeight: '700', fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: '#1b3a6b' },
  statValueSecondary: { fontWeight: '700', fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: '#1960a6' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontWeight: '600', fontSize: 16, lineHeight: 24, color: '#191c1e' },
  stressCard: {
    backgroundColor: '#F8F1E8', borderLeftWidth: 4, borderRadius: 12,
    borderTopLeftRadius: 4, borderBottomLeftRadius: 4, padding: 16, gap: 12,
  },
  stressCardTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stressIconCircle: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#fff',
    backgroundColor: '#F8F1E8', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stressLevel: { fontWeight: '600', fontSize: 12, lineHeight: 16 },
  stressDetail: { fontWeight: '500', fontSize: 14, lineHeight: 20, marginTop: 2 },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  wellbeingList: { gap: 10 },
  wellbeingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8', borderRadius: 12, padding: 16,
  },
  wellbeingIconBox: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: '#f2f4f6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  wellbeingText: { flex: 1, gap: 2 },
  wellbeingTitle: { fontWeight: '600', fontSize: 12, lineHeight: 16, color: '#1b3a6b', letterSpacing: 0.3 },
  wellbeingSubtitle: { fontWeight: '500', fontSize: 11, lineHeight: 14, color: '#747780', letterSpacing: 0.5 },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#185FA5', borderRadius: 12, paddingVertical: 16,
    shadowColor: '#185FA5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  ctaText: { fontWeight: '600', fontSize: 16, color: '#fff' },
});
