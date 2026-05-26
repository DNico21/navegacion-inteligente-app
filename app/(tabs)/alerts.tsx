import { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getRoutes } from '@/utils/mapsService';
import { SABANA_LOCATIONS } from '@/constants/locations';
import { PlanningContext } from '@/context/PlanningContext/PlanningContext';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

// Corridors to monitor
const CORRIDORS = [
  { originId: 'chia_centro', destId: 'unisabana', label: 'Chía → Universidad' },
  { originId: 'cajica', destId: 'unisabana', label: 'Cajicá → Universidad' },
  { originId: 'chia_centro', destId: 'bogota_norte', label: 'Chía → Bogotá Norte' },
];

interface CorridorStatus {
  label: string;
  durationMinutes: number;
  baseMinutes: number;
  ratio: number;
  delayMinutes: number;
  level: 'normal' | 'moderate' | 'heavy';
  error?: boolean;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getLevel(ratio: number): 'normal' | 'moderate' | 'heavy' {
  if (ratio < 1.15) return 'normal';
  if (ratio < 1.4) return 'moderate';
  return 'heavy';
}

const LEVEL_THEME = {
  normal: { bg: '#EBF5E9', border: '#2D751A', text: '#2D751A', icon: 'check-circle', label: 'Normal' },
  moderate: { bg: '#F8F1E8', border: '#8F5A12', text: '#8F5A12', icon: 'warning', label: 'Moderado' },
  heavy: { bg: '#FCECEC', border: '#B03A39', text: '#B03A39', icon: 'dangerous', label: 'Congestionado' },
};

export default function AlertsScreen() {
  const { state: planState } = useContext(PlanningContext);
  const { state: authState } = useContext(AuthContext);
  const user = authState.user;

  const [corridors, setCorridors] = useState<CorridorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrafficData = useCallback(async () => {
    const results = await Promise.all(
      CORRIDORS.map(async (corridor) => {
        const origin = SABANA_LOCATIONS.find(l => l.id === corridor.originId)!;
        const dest = SABANA_LOCATIONS.find(l => l.id === corridor.destId)!;
        try {
          const routes = await getRoutes(origin.coordinate, dest.coordinate);
          const best = routes[0];
          const durationMinutes = Math.round(best.durationInTrafficSeconds / 60);
          const baseMinutes = Math.round(best.durationSeconds / 60);
          const ratio = best.durationInTrafficSeconds / best.durationSeconds;
          const delayMinutes = Math.round((best.durationInTrafficSeconds - best.durationSeconds) / 60);
          return {
            label: corridor.label,
            durationMinutes,
            baseMinutes,
            ratio,
            delayMinutes,
            level: getLevel(ratio),
          } satisfies CorridorStatus;
        } catch {
          return {
            label: corridor.label,
            durationMinutes: 0,
            baseMinutes: 0,
            ratio: 1,
            delayMinutes: 0,
            level: 'normal' as const,
            error: true,
          };
        }
      }),
    );
    setCorridors(results);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTrafficData().finally(() => setLoading(false));
  }, [fetchTrafficData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrafficData();
    setRefreshing(false);
  }, [fetchTrafficData]);

  const initials = user
    ? `${(user.firstname ?? '')[0] ?? ''}${(user.lastname ?? '')[0] ?? ''}`.toUpperCase() || '?'
    : '?';

  const heavyCorridor = corridors.find(c => c.level === 'heavy');
  const moderateCorridor = corridors.find(c => c.level === 'moderate');
  const alertCorridor = heavyCorridor ?? moderateCorridor;

  const upcomingTrips = planState.trips.filter(t => {
    const [h, m] = t.departureSuggested.split(':').map(Number);
    const now = new Date();
    const depTotal = h * 60 + m;
    const nowTotal = now.getHours() * 60 + now.getMinutes();
    return depTotal > nowTotal;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <MaterialIcons name="navigation" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Sabana Centro</Text>
          </View>
          <Text style={styles.headerSub}>Monitoreo de tráfico en tiempo real</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/profile' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />
        }
      >
        {/* Page title */}
        <View style={styles.pageTitleRow}>
          <Text style={styles.pageTitle}>Alertas</Text>
          <TouchableOpacity onPress={onRefresh} hitSlop={8}>
            <MaterialIcons name="refresh" size={24} color="#185FA5" />
          </TouchableOpacity>
        </View>

        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        {/* Alert banner — shown only when there's congestion */}
        {!loading && alertCorridor && (
          <View style={[styles.anomalyBanner, { borderLeftColor: LEVEL_THEME[alertCorridor.level].border }]}>
            <View style={{ marginTop: 4 }}>
              <View style={[styles.anomalyDot, { backgroundColor: LEVEL_THEME[alertCorridor.level].border }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.anomalyTitle, { color: LEVEL_THEME[alertCorridor.level].text }]}>
                {alertCorridor.level === 'heavy' ? 'Congestión detectada' : 'Tráfico moderado'} — {alertCorridor.label}
              </Text>
              <Text style={[styles.anomalyBody, { color: LEVEL_THEME[alertCorridor.level].text + 'CC' }]}>
                {alertCorridor.delayMinutes > 0
                  ? `+${alertCorridor.delayMinutes} min sobre el tiempo normal. Considera salir antes.`
                  : 'Tráfico ligeramente por encima de lo normal.'}
              </Text>
            </View>
            <MaterialIcons name="warning" size={22} color={LEVEL_THEME[alertCorridor.level].border} />
          </View>
        )}

        {/* Upcoming trips section */}
        {upcomingTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notifications-active" size={18} color="#185FA5" />
              <Text style={styles.sectionTitle}>Próximas salidas de hoy</Text>
            </View>
            {upcomingTrips.map(trip => {
              const notifH = Math.floor(Math.max(0, ...(() => {
                const [h, m] = trip.departureSuggested.split(':').map(Number);
                return [h * 60 + m - 30];
              })()) / 60);
              const notifM = Math.max(0, ...(() => {
                const [h, m] = trip.departureSuggested.split(':').map(Number);
                return [(h * 60 + m - 30) % 60];
              })());
              const notifTime = `${String(notifH).padStart(2, '0')}:${String(notifM).padStart(2, '0')}`;

              return (
                <View key={trip.id} style={styles.pushCard}>
                  <View style={styles.pushCardTop}>
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowBadgeText}>
                        SALE A LAS {formatTime12h(trip.departureSuggested)}
                      </Text>
                    </View>
                    <MaterialIcons name="notifications-active" size={18} color="rgba(255,255,255,0.6)" />
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text style={styles.pushTitle}>
                      Llegar a {trip.destinationLabel.split(' ')[0]} a las {formatTime12h(trip.arrivalTime)}
                    </Text>
                    <Text style={styles.pushBody}>
                      {trip.originLabel} → {trip.destinationLabel}{'\n'}
                      Tiempo estimado: {trip.estimatedMinutes} min ± {trip.marginMinutes} min
                      {trip.marginMinutes < 10 ? ' 🟢' : trip.marginMinutes < 20 ? ' 🟡' : ' 🔴'}
                    </Text>
                  </View>
                  <View style={styles.pushDivider} />
                  <View style={styles.pushActions}>
                    <TouchableOpacity
                      style={styles.pushBtnPrimary}
                      activeOpacity={0.85}
                      onPress={() => router.push('/' as any)}
                    >
                      <Text style={styles.pushBtnPrimaryText}>Ver Rutas</Text>
                    </TouchableOpacity>
                    <View style={styles.pushBtnSecondary}>
                      <Text style={styles.pushBtnSecondaryText}>
                        Notif: {formatTime12h(notifTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Corridors section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={18} color="#185FA5" />
            <Text style={styles.sectionTitle}>Estado de corredores</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#185FA5" />
              <Text style={styles.loadingText}>Consultando tráfico en tiempo real…</Text>
            </View>
          ) : (
            corridors.map(c => {
              const theme = LEVEL_THEME[c.level];
              return (
                <View key={c.label} style={[styles.corridorCard, { borderLeftColor: theme.border }]}>
                  <View style={styles.corridorTop}>
                    <MaterialIcons name={theme.icon as any} size={20} color={theme.text} />
                    <Text style={[styles.corridorLabel, { color: theme.text }]}>{c.label}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: theme.bg }]}>
                      <Text style={[styles.levelBadgeText, { color: theme.text }]}>{theme.label}</Text>
                    </View>
                  </View>
                  {c.error ? (
                    <Text style={styles.corridorError}>Sin datos disponibles</Text>
                  ) : (
                    <View style={styles.corridorStats}>
                      <Text style={styles.corridorTime}>
                        {c.durationMinutes} min con tráfico
                      </Text>
                      {c.delayMinutes > 0 && (
                        <Text style={[styles.corridorDelay, { color: theme.text }]}>
                          +{c.delayMinutes} min vs tiempo normal
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* No upcoming trips message */}
        {upcomingTrips.length === 0 && (
          <TouchableOpacity
            style={styles.planDayBanner}
            activeOpacity={0.85}
            onPress={() => router.push('/plan-day' as any)}
          >
            <MaterialIcons name="event" size={22} color="#185FA5" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.planDayBannerTitle}>Sin viajes planificados hoy</Text>
              <Text style={styles.planDayBannerSub}>
                Agrega viajes en "Mi Día" para ver alertas de salida aquí.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#185FA5" />
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavBar active="alerts" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1B3A6B',
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 88,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 24 },

  pageTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#191c1e', letterSpacing: -0.5 },
  lastUpdated: { fontSize: 11, color: '#9EA3AC', marginTop: -8 },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1B3A6B' },

  anomalyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#FCECEC', borderLeftWidth: 4,
    borderRadius: 8, padding: 14,
  },
  anomalyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  anomalyTitle: { fontSize: 15, fontWeight: '700', lineHeight: 22 },
  anomalyBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },

  // Push card (upcoming trips)
  pushCard: {
    backgroundColor: '#1b3a6b', borderRadius: 12, padding: 16, gap: 12,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  pushCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowBadge: {
    backgroundColor: '#1960a6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999,
  },
  nowBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  pushTitle: { fontSize: 17, fontWeight: '600', color: '#fff', lineHeight: 24, letterSpacing: -0.3 },
  pushBody: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.85)' },
  pushDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  pushActions: { flexDirection: 'row', gap: 12 },
  pushBtnPrimary: {
    flex: 1, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  pushBtnPrimaryText: { fontSize: 12, fontWeight: '600', color: '#1b3a6b' },
  pushBtnSecondary: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  pushBtnSecondaryText: { fontSize: 11, fontWeight: '600', color: '#fff' },

  // Corridor cards
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderRadius: 10 },
  loadingText: { fontSize: 13, color: '#747780' },

  corridorCard: {
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#C5CDD8', borderLeftWidth: 4,
    padding: 14, gap: 6,
  },
  corridorTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  corridorLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  corridorStats: { paddingLeft: 28, gap: 2 },
  corridorTime: { fontSize: 15, fontWeight: '700', color: '#1B3A6B' },
  corridorDelay: { fontSize: 12, fontWeight: '500' },
  corridorError: { fontSize: 12, color: '#9EA3AC', paddingLeft: 28 },

  // Plan day banner
  planDayBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EBF3FF', borderWidth: 1, borderColor: '#9ec5ff',
    borderRadius: 12, padding: 14,
  },
  planDayBannerTitle: { fontSize: 14, fontWeight: '700', color: '#1B3A6B' },
  planDayBannerSub: { fontSize: 12, color: '#185FA5' },

});
