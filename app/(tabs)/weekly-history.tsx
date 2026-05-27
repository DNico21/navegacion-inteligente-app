import { useContext, useEffect, useState } from 'react';
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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChartItem {
  label: string;
  minutes: number;
  real: number;
  est: number;
  anomaly: boolean;
}

interface WeekStats {
  chartData: ChartItem[];
  accuracy: number;
  timeSavedMin: number;
  punctuality: number;
  co2SavedKg: number;
  avgThisWeek: number;
  avgLastWeek: number | null;
  trendPercent: number | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getWeekDates(): { dates: string[]; dayIndices: number[] } {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const dates: string[] = [];
  const dayIndices: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dates.push(iso);
    dayIndices.push(d.getDay()); // 0=Sun..6=Sat
  }
  return { dates, dayIndices };
}

function getPreviousWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) - 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

function buildStats(
  thisWeekTrips: any[],
  prevWeekTrips: any[],
  weekDates: string[],
  dayIndices: number[],
): WeekStats {
  // Group this week by date
  const byDate: Record<string, any[]> = {};
  for (const trip of thisWeekTrips) {
    if (!byDate[trip.date]) byDate[trip.date] = [];
    byDate[trip.date].push(trip);
  }

  // Build per-day summaries
  const daySummaries = weekDates.map((date, i) => {
    const trips = byDate[date] ?? [];
    if (trips.length === 0) return null;
    const avgMin = Math.round(trips.reduce((s: number, t: any) => s + (t.estimatedMinutes ?? 0), 0) / trips.length);
    const avgMargin = Math.round(trips.reduce((s: number, t: any) => s + (t.marginMinutes ?? 0), 0) / trips.length);
    return { dayIndex: dayIndices[i], avgMin, avgMargin };
  }).filter(Boolean) as { dayIndex: number; avgMin: number; avgMargin: number }[];

  if (daySummaries.length === 0) {
    return {
      chartData: [],
      accuracy: 0,
      timeSavedMin: 0,
      punctuality: 0,
      co2SavedKg: 0,
      avgThisWeek: 0,
      avgLastWeek: null,
      trendPercent: null,
    };
  }

  const maxMin = Math.max(...daySummaries.map(d => d.avgMin + d.avgMargin));
  const weekAvgMin = Math.round(daySummaries.reduce((s, d) => s + d.avgMin, 0) / daySummaries.length);

  const chartData: ChartItem[] = daySummaries.map(d => {
    const real = Math.round((d.avgMin / maxMin) * 82);
    const est = Math.min(Math.round((d.avgMargin / maxMin) * 82), 100 - real);
    const anomaly = d.avgMin > weekAvgMin * 1.5;
    return {
      label: DAY_LABELS[d.dayIndex],
      minutes: d.avgMin,
      real,
      est,
      anomaly,
    };
  });

  // CO₂: each marginMinute saved = (30 km/h ÷ 60) × 0.12 kg CO₂/km ≈ 0.06 kg
  const totalMarginMin = thisWeekTrips.reduce((s: number, t: any) => s + (t.marginMinutes ?? 0), 0);
  const co2SavedKg = Math.round(totalMarginMin * 0.06 * 10) / 10;
  const timeSavedMin = totalMarginMin;

  // Accuracy: % of trips with margin ≤ 10 min (low uncertainty)
  const accurateTrips = thisWeekTrips.filter((t: any) => (t.marginMinutes ?? 99) <= 10).length;
  const accuracy = thisWeekTrips.length > 0 ? Math.round((accurateTrips / thisWeekTrips.length) * 100) : 0;

  // Punctuality: same as accuracy for MVP
  const punctuality = accuracy;

  // Previous week avg
  let avgLastWeek: number | null = null;
  let trendPercent: number | null = null;
  if (prevWeekTrips.length > 0) {
    avgLastWeek = Math.round(prevWeekTrips.reduce((s: number, t: any) => s + (t.estimatedMinutes ?? 0), 0) / prevWeekTrips.length);
    if (avgLastWeek > 0) {
      trendPercent = Math.round(((weekAvgMin - avgLastWeek) / avgLastWeek) * 100);
    }
  }

  return { chartData, accuracy, timeSavedMin, punctuality, co2SavedKg, avgThisWeek: weekAvgMin, avgLastWeek, trendPercent };
}

// ─── Circular progress ──────────────────────────────────────────────────────

function CircularProgress({ size = 64, percent = 92 }: { size?: number; percent?: number }) {
  const half = size / 2;
  const sw = 4;
  const isOver50 = percent >= 50;
  const rightRot = isOver50 ? 0 : (percent / 50) * 180 - 180;
  const leftRot = isOver50 ? ((percent - 50) / 50) * 180 - 180 : -180;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: half, borderWidth: sw, borderColor: 'rgba(255,255,255,0.25)' },
      ]} />
      <View style={{ position: 'absolute', right: 0, top: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', left: -half, top: 0,
          width: size, height: size, borderRadius: half,
          borderWidth: sw, borderColor: '#fff',
          transform: [{ rotate: `${rightRot}deg` }],
        }} />
      </View>
      {isOver50 && (
        <View style={{ position: 'absolute', left: 0, top: 0, width: half, height: size, overflow: 'hidden' }}>
          <View style={{
            position: 'absolute', right: -half, top: 0,
            width: size, height: size, borderRadius: half,
            borderWidth: sw, borderColor: '#fff',
            transform: [{ rotate: `${leftRot}deg` }],
          }} />
        </View>
      )}
      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>TOP</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WeeklyHistoryScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;

  const [stats, setStats] = useState<WeekStats | null>(null);
  const [loading, setLoading] = useState(true);

  const initials = user?.firstname && user?.lastname
    ? (user.firstname[0] + user.lastname[0]).toUpperCase()
    : (user?.fullName ?? 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    async function loadData() {
      const uid = auth.currentUser?.uid;
      if (!uid) { setLoading(false); return; }

      const { dates: thisWeekDates, dayIndices } = getWeekDates();
      const prevWeekDates = getPreviousWeekDates();

      const [thisSnap, prevSnap] = await Promise.all([
        getDocs(query(collection(db, 'planned_trips'), where('userId', '==', uid), where('date', 'in', thisWeekDates))),
        getDocs(query(collection(db, 'planned_trips'), where('userId', '==', uid), where('date', 'in', prevWeekDates))),
      ]);

      const thisWeekTrips = thisSnap.docs.map(d => d.data());
      const prevWeekTrips = prevSnap.docs.map(d => d.data());

      setStats(buildStats(thisWeekTrips, prevWeekTrips, thisWeekDates, dayIndices));
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Historial Semanal</Text>
            <Text style={styles.headerSub}>Análisis de eficiencia</Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={8}>
          <MaterialIcons name="notifications" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#185FA5" />
          <Text style={styles.loadingText}>Cargando tu historial…</Text>
        </View>
      ) : !stats || stats.chartData.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bento metrics */}
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={[styles.bentoCard, { flex: 1 }]}>
                <View style={styles.bentoTop}>
                  <MaterialIcons name="verified" size={22} color="#1960a6" />
                  <View style={styles.predictBadge}>
                    <Text style={styles.predictText}>PREDICTABLE</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.metricLabel}>Accuracy</Text>
                  <Text style={styles.metricValue}>{stats.accuracy}%</Text>
                </View>
              </View>

              <View style={[styles.bentoCard, { flex: 1, justifyContent: 'space-between' }]}>
                <MaterialIcons name="schedule" size={22} color="#1960a6" />
                <View>
                  <Text style={styles.metricLabel}>Time Saved</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={styles.metricValue}>{stats.timeSavedMin}</Text>
                    <Text style={styles.metricUnit}>min</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.bentoPrimary}>
              <View>
                <Text style={styles.punctualityLabel}>Punctuality Score</Text>
                <Text style={styles.punctualityValue}>{stats.punctuality}%</Text>
              </View>
              <CircularProgress size={64} percent={stats.punctuality} />
            </View>
          </View>

          {/* CO₂ Impact card */}
          <View style={styles.co2Card}>
            <View style={styles.co2Left}>
              <View style={styles.co2IconBox}>
                <MaterialIcons name="eco" size={22} color="#2D751A" />
              </View>
              <View>
                <Text style={styles.co2Title}>Impacto Ambiental</Text>
                <Text style={styles.co2Sub}>Emisiones evitadas esta semana</Text>
              </View>
            </View>
            <View style={styles.co2Right}>
              <Text style={styles.co2Value}>{stats.co2SavedKg} kg</Text>
              <Text style={styles.co2Unit}>CO₂</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.cardTitle}>Tiempo por Trayecto</Text>
                <Text style={styles.cardSub}>Comparativa Real vs. Estimado</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1960a6' }} />
                  <Text style={styles.legendText}>Real</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#7ab3ff' }} />
                  <Text style={styles.legendText}>Margen</Text>
                </View>
              </View>
            </View>

            <View style={{ gap: 14 }}>
              {stats.chartData.map(item => (
                <View key={item.label} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={item.anomaly ? styles.chartLabelAnomaly : styles.chartLabel}>
                      {item.label}{item.anomaly ? ' ⚠️' : ''}
                    </Text>
                    <Text style={item.anomaly ? styles.chartLabelAnomaly : styles.chartLabel}>
                      {item.minutes} min
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { flex: item.real },
                      item.anomaly && { backgroundColor: '#ba1a1a' },
                    ]} />
                    {item.est > 0 && <View style={[styles.barEst, { flex: item.est }]} />}
                    {(100 - item.real - item.est) > 0 && (
                      <View style={{ flex: 100 - item.real - item.est }} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Comparison */}
          <View style={styles.compCard}>
            <View style={styles.compHeader}>
              <Text style={styles.cardTitle}>Rendimiento Comparativo</Text>
            </View>
            <View style={styles.compRow}>
              <View>
                <Text style={styles.compPeriodLabel}>ESTA SEMANA</Text>
                <Text style={styles.compAvg}>{stats.avgThisWeek} min avg.</Text>
              </View>
              {stats.trendPercent !== null && (
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <MaterialIcons
                      name={stats.trendPercent <= 0 ? 'trending-down' : 'trending-up'}
                      size={14}
                      color={stats.trendPercent <= 0 ? '#2D751A' : '#ba1a1a'}
                    />
                    <Text style={[styles.compTrend, stats.trendPercent > 0 && { color: '#ba1a1a' }]}>
                      {stats.trendPercent > 0 ? '+' : ''}{stats.trendPercent}%
                    </Text>
                  </View>
                  <Text style={styles.compVsLabel}>vs. anterior</Text>
                </View>
              )}
            </View>
            {stats.avgLastWeek !== null && (
              <View style={[styles.compRow, { opacity: 0.6, borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.compPeriodLabel}>SEMANA PASADA</Text>
                  <Text style={styles.compAvg}>{stats.avgLastWeek} min avg.</Text>
                </View>
                <View style={{ width: 48, height: 4, backgroundColor: '#eceef0', borderRadius: 9999 }} />
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <BottomNavBar active="home" />
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyWrapper}>
      <MaterialIcons name="insert-chart-outlined" size={56} color="#C5CDD8" />
      <Text style={styles.emptyTitle}>Sin viajes esta semana</Text>
      <Text style={styles.emptySub}>Planifica tu primer trayecto en la pestaña "Mi Día" para ver tu historial aquí.</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1B3A6B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#c4c6d0',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerTitle: { fontWeight: '600', fontSize: 14, color: '#1B3A6B' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 24 },

  loadingWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },

  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A6B', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },

  bentoCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 14, height: 128,
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  bentoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  predictBadge: {
    backgroundColor: '#EBF5E9', borderRadius: 9999,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  predictText: { fontSize: 9, fontWeight: '700', color: '#2D751A' },
  metricLabel: { fontSize: 12, fontWeight: '600', color: '#44474f', letterSpacing: 0.2 },
  metricValue: { fontSize: 26, fontWeight: '700', color: '#002452', letterSpacing: -0.5, lineHeight: 32 },
  metricUnit: { fontSize: 11, fontWeight: '500', color: '#1960a6' },

  bentoPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1b3a6b',
    borderWidth: 1, borderColor: '#002452',
    borderRadius: 12, padding: 16,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  punctualityLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  punctualityValue: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },

  // CO₂ card
  co2Card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F0FAF0',
    borderWidth: 1, borderColor: '#A8D5A2',
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  co2Left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  co2IconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EBF5E9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#A8D5A2',
  },
  co2Title: { fontSize: 15, fontWeight: '700', color: '#1A4D1A' },
  co2Sub: { fontSize: 12, color: '#4A7A4A', marginTop: 2 },
  co2Right: { alignItems: 'flex-end' },
  co2Value: { fontSize: 26, fontWeight: '700', color: '#2D751A', letterSpacing: -0.5 },
  co2Unit: { fontSize: 11, fontWeight: '600', color: '#4A7A4A', textTransform: 'uppercase', letterSpacing: 0.8 },

  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 16, gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#002452' },
  cardSub: { fontSize: 12, fontWeight: '600', color: '#44474f', letterSpacing: 0.2, marginTop: 2 },
  legendText: { fontSize: 10, fontWeight: '600', color: '#44474f' },

  chartLabel: { fontSize: 11, fontWeight: '500', color: '#44474f', letterSpacing: 0.5 },
  chartLabelAnomaly: { fontSize: 11, fontWeight: '700', color: '#ba1a1a' },
  barTrack: {
    height: 12, backgroundColor: '#eceef0',
    borderRadius: 9999, overflow: 'hidden', flexDirection: 'row',
  },
  barFill: { backgroundColor: '#1960a6' },
  barEst: { backgroundColor: '#7ab3ff', opacity: 0.5 },

  compCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  compHeader: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
    backgroundColor: '#F2F4F6',
  },
  compRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
  },
  compPeriodLabel: {
    fontSize: 11, fontWeight: '600', color: '#44474f',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  compAvg: { fontSize: 18, fontWeight: '700', color: '#002452', letterSpacing: -0.2, marginTop: 2 },
  compTrend: { fontSize: 11, fontWeight: '700', color: '#2D751A' },
  compVsLabel: { fontSize: 11, fontWeight: '500', color: '#44474f' },
});
