import { useContext, useEffect } from 'react';
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
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { RouteContext } from '@/context/RouteContext/RouteContext';
import { PlanningContext } from '@/context/PlanningContext/PlanningContext';
import { SABANA_REGION } from '@/constants/locations';

const DEFAULT_SUGGESTION = 'Calculando el mejor horario de salida para tu ruta...';

type ReliabilityLevel = 'low' | 'moderate' | 'high';

const RELIABILITY_THEME: Record<
  ReliabilityLevel,
  { bg: string; color: string; border: string }
> = {
  low: { bg: '#EBF5E9', color: '#2D751A', border: '#2D751A' },
  moderate: { bg: '#F8F1E8', color: '#8F5A12', border: '#c4c6d0' },
  high: { bg: '#FCECEC', color: '#B03A39', border: '#c4c6d0' },
};

const NAV_TABS = [
  { icon: 'home', label: 'Inicio', active: true, route: null },
  { icon: 'notifications', label: 'Alertas', active: false, route: '/alerts' },
  { icon: 'event', label: 'Mi Día', active: false, route: '/plan-day' },
  { icon: 'account-circle', label: 'Perfil', active: false, route: '/profile' },
];

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

function getReliabilityLevel(durationSecs: number, baseSecs: number): ReliabilityLevel {
  const ratio = durationSecs / baseSecs;
  if (ratio < 1.15) return 'low';
  if (ratio < 1.4) return 'moderate';
  return 'high';
}

export default function TodayRoutesScreen() {
  const { state, fetchRoutes, selectRoute } = useContext(RouteContext);
  const { state: planState } = useContext(PlanningContext);
  const { routes, loading, error, suggestion, origin, destination } = state;
  const todayTrips = planState.trips;

  useEffect(() => {
    fetchRoutes();
  }, []);

  const now = new Date();
  const timeLabel = `${origin.label.split(' ')[0]} → ${destination.label.split(' ')[0]} · ${now.toLocaleDateString('es-CO', { weekday: 'short' })} ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="navigation" size={24} color="#fff" />
          <View>
            <Text style={styles.headerTitle}>Sabana Centro</Text>
            <Text style={styles.headerSub}>Navegación Inteligente</Text>
          </View>
        </View>
        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={22} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.pageTitle}>Rutas de hoy</Text>
            {loading && <ActivityIndicator size="small" color="#185FA5" />}
          </View>
          <Text style={styles.pageSubtitle}>{timeLabel}</Text>
        </View>

        {/* Suggestion card */}
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionBgIcon} pointerEvents="none">
            <MaterialIcons name="schedule" size={120} color="#fff" style={{ opacity: 0.1 }} />
          </View>
          <View style={styles.suggestionContent}>
            <MaterialIcons name="lightbulb" size={22} color="#fff" style={{ marginTop: 2 }} />
            <View style={styles.suggestionText}>
              <Text style={styles.suggestionTitle}>Optimización sugerida</Text>
              <Text style={styles.suggestionBody}>
                {suggestion ?? DEFAULT_SUGGESTION}
              </Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={18} color="#B03A39" />
            <Text style={styles.errorText}>
              No se pudo conectar a Google Maps. Verifica tu API key.
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider}>
          <Text style={styles.dividerLabel}>ORDENADO POR TIEMPO</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Route cards — reales si hay datos, hardcoded de fallback si no */}
        {(routes.length > 0 ? routes : []).map((route, i) => {
          const level = getReliabilityLevel(route.durationInTrafficSeconds, route.durationSeconds);
          const theme = RELIABILITY_THEME[level];
          const labels = ['Recomendada', 'Alternativa 1', 'Alternativa 2'];
          const reliabilityLabels: Record<ReliabilityLevel, string> = {
            low: 'PREDECIBLE', moderate: 'VARIABLE', high: 'IMPREDECIBLE',
          };
          const extra = Math.round((route.durationInTrafficSeconds - route.durationSeconds) / 60);
          return (
            <TouchableOpacity
              key={route.index}
              style={[styles.routeCard, { borderColor: theme.border }]}
              activeOpacity={0.88}
              onPress={() => { selectRoute(i); router.push('/route-detail'); }}
            >
              <View style={[styles.routeCardHeader, { backgroundColor: theme.bg }]}>
                <Text style={[styles.routeBadge, { color: theme.color }]}>{labels[i] ?? `Alternativa ${i}`}</Text>
                <Text style={[styles.routeReliability, { color: theme.color }]}>{reliabilityLabels[level]}</Text>
              </View>
              <View style={styles.routeCardBody}>
                <View style={styles.routeLeft}>
                  <Text style={styles.routeName}>{route.summary}</Text>
                  <Text style={styles.trafficLabel}>
                    {extra > 0 ? `+${extra} min por tráfico` : 'Sin retrasos por tráfico'}
                  </Text>
                </View>
                <View style={styles.routeRight}>
                  <Text style={styles.routeTime}>{formatMinutes(route.durationInTrafficSeconds)}</Text>
                  <Text style={styles.routeUncertainty}>{route.distanceText}</Text>
                  <Text style={[styles.routeMargin, { color: theme.color }]}>
                    {level === 'low' ? '🟢' : level === 'moderate' ? '🟡' : '🔴'} predecible
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Planned trips from Mi Día */}
        {todayTrips.length > 0 && (
          <>
            <View style={styles.divider}>
              <Text style={styles.dividerLabel}>MIS VIAJES DE HOY</Text>
              <View style={styles.dividerLine} />
            </View>
            {todayTrips.map(trip => {
              const marginColor = trip.marginMinutes < 10 ? '#2D751A' : trip.marginMinutes < 20 ? '#8F5A12' : '#B03A39';
              const marginEmoji = trip.marginMinutes < 10 ? '🟢' : trip.marginMinutes < 20 ? '🟡' : '🔴';
              const [ah, am] = trip.arrivalTime.split(':').map(Number);
              const ampm = ah >= 12 ? 'PM' : 'AM';
              const arrivalLabel = `${ah % 12 || 12}:${String(am).padStart(2, '0')} ${ampm}`;
              const [dh, dm] = trip.departureSuggested.split(':').map(Number);
              const dampm = dh >= 12 ? 'PM' : 'AM';
              const departLabel = `${dh % 12 || 12}:${String(dm).padStart(2, '0')} ${dampm}`;
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripMiniCard}
                  activeOpacity={0.88}
                  onPress={() => router.push('/plan-day' as any)}
                >
                  <View style={styles.tripMiniLeft}>
                    <MaterialIcons name="event" size={18} color="#185FA5" />
                    <View style={{ gap: 2 }}>
                      <Text style={styles.tripMiniTitle}>
                        Llegar a las {arrivalLabel} — {trip.destinationLabel.split(' ')[0]}
                      </Text>
                      <Text style={styles.tripMiniSub}>
                        {trip.originLabel.split(' ')[0]} → {trip.destinationLabel.split(' ')[0]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tripMiniRight}>
                    <Text style={styles.tripMiniDepart}>{departLabel}</Text>
                    <Text style={[styles.tripMiniMargin, { color: marginColor }]}>
                      ±{trip.marginMinutes} min {marginEmoji}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Mi día shortcut */}
        <TouchableOpacity
          style={styles.planDayCard}
          activeOpacity={0.85}
          onPress={() => router.push('/plan-day' as any)}
        >
          <View style={styles.wellnessCardLeft}>
            <MaterialIcons name="event" size={22} color="#1B3A6B" />
            <View>
              <Text style={styles.planDayTitle}>
                Planea tu día
                {todayTrips.length > 0 && (
                  <Text style={styles.planDayBadge}>  {todayTrips.length} viaje{todayTrips.length > 1 ? 's' : ''}</Text>
                )}
              </Text>
              <Text style={styles.planDaySub}>
                {todayTrips.length > 0
                  ? `Próximo: salir a las ${todayTrips[0].departureSuggested.replace(':', 'h ')}`
                  : 'Agrega viajes y recibe alertas de salida'}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#1B3A6B" />
        </TouchableOpacity>

        {/* Wellness shortcut */}
        <TouchableOpacity
          style={styles.wellnessCard}
          activeOpacity={0.85}
          onPress={() => router.push('/wellness-mode' as any)}
        >
          <View style={styles.wellnessCardLeft}>
            <MaterialIcons name="spa" size={22} color="#185FA5" />
            <View>
              <Text style={styles.wellnessCardTitle}>Modo Bienestar</Text>
              <Text style={styles.wellnessCardSub}>Respiración, música y calma para el trayecto</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#185FA5" />
        </TouchableOpacity>

        {/* Mapa miniatura */}
        <View style={styles.mapPlaceholder}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={SABANA_REGION}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
          >
            {routes[0]?.polylineCoords && routes[0].polylineCoords.length > 0 && (
              <Polyline
                coordinates={routes[0].polylineCoords}
                strokeColor="#185FA5"
                strokeWidth={3}
              />
            )}
          </MapView>
          <View style={styles.mapOverlay} />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => { selectRoute(0); router.push('/route-detail'); }}
          >
            <MaterialIcons name="map" size={18} color="#fff" />
            <Text style={styles.mapButtonText}>Ver Mapa Completo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => router.push('/route-setup' as any)}>
        <MaterialIcons name="directions" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Bottom Navigation Bar ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.navTab, tab.active && styles.navTabActive]}
            onPress={() => tab.route && router.push(tab.route as any)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={tab.active ? '#185FA5' : '#64748b'}
            />
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },

  // ── Header ──
  header: {
    backgroundColor: '#1b3a6b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 88,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },

  // Section header
  sectionHeader: {
    gap: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#002452',
  },
  badge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c4c6d0',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
    color: '#002452',
    letterSpacing: 0.8,
  },
  pageSubtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#747780',
  },

  // Suggestion card
  suggestionCard: {
    backgroundColor: '#1b3a6b',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#1b3a6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionBgIcon: {
    position: 'absolute',
    top: -16,
    right: -16,
  },
  suggestionContent: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  suggestionText: {
    flex: 1,
    gap: 4,
  },
  suggestionTitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  suggestionBody: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#89a5dd',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLabel: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#747780',
    flexShrink: 0,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c4c6d0',
  },

  // Route card
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  routeBadge: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  routeReliability: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  routeCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  routeLeft: {
    flex: 1,
    gap: 6,
  },
  routeName: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: '#002452',
  },
  trafficRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trafficDots: {
    flexDirection: 'row',
    gap: 4,
  },
  trafficDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trafficLabel: {
    fontWeight: '500',
    fontSize: 11,
    color: '#747780',
  },
  routeRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  routeTime: {
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 30,
    color: '#002452',
  },
  routeUncertainty: {
    fontWeight: '500',
    fontSize: 13,
    color: '#747780',
    marginTop: 2,
  },
  routeMargin: {
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  routeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
  },
  routeFooterText: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#747780',
  },

  // Map placeholder
  mapPlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4c6d0',
    backgroundColor: '#d8dadc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapPlaceholderText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9EA3AC',
    fontWeight: '500',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,36,82,0.35)',
  },
  mapButton: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#002452',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
  },

  // Trip mini cards (planned trips in home screen)
  tripMiniCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#C5CDD8', borderLeftWidth: 3, borderLeftColor: '#185FA5',
    padding: 12, gap: 10,
  },
  tripMiniLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tripMiniTitle: { fontSize: 13, fontWeight: '600', color: '#1B3A6B', lineHeight: 18 },
  tripMiniSub: { fontSize: 11, color: '#747780' },
  tripMiniRight: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  tripMiniDepart: { fontSize: 15, fontWeight: '800', color: '#1B3A6B' },
  tripMiniMargin: { fontSize: 11, fontWeight: '600' },

  // Plan day card
  planDayCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EBF3FF',
    borderWidth: 1, borderColor: '#9ec5ff',
    borderRadius: 12, padding: 14,
  },
  planDayTitle: { fontSize: 15, fontWeight: '700', color: '#1B3A6B' },
  planDayBadge: { fontSize: 12, fontWeight: '600', color: '#185FA5' },
  planDaySub: { fontSize: 12, color: '#185FA5', marginTop: 1 },

  // Wellness shortcut
  wellnessCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EBF3FF',
    borderWidth: 1, borderColor: '#7ab3ff',
    borderRadius: 12, padding: 14,
  },
  wellnessCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  wellnessCardTitle: { fontSize: 15, fontWeight: '600', color: '#1B3A6B' },
  wellnessCardSub: { fontSize: 12, color: '#185FA5', marginTop: 1 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#185FA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b3a6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 40,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#C5CDD8',
    paddingHorizontal: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  navTabActive: {
    backgroundColor: 'rgba(235,245,249,0.5)',
    borderRadius: 12,
  },
  navLabel: {
    fontWeight: '500',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#185FA5',
    fontWeight: '700',
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FCECEC',
    borderLeftWidth: 4,
    borderLeftColor: '#B03A39',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B03A39',
    fontWeight: '500',
  },
});
