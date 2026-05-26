import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavBar from '@/components/BottomNavBar';

const CHART_DATA = [
  { label: 'Lun', minutes: 42, real: 84, est: 10, anomaly: false },
  { label: 'Mar', minutes: 38, real: 76, est: 15, anomaly: false },
  { label: 'Mié', minutes: 45, real: 90, est: 5, anomaly: false },
  { label: 'Jue (Anomalía)', minutes: 65, real: 100, est: 0, anomaly: true },
  { label: 'Vie', minutes: 40, real: 80, est: 12, anomaly: false },
];

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

export default function WeeklyHistoryScreen() {
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
            <Text style={styles.avatarText}>DN</Text>
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
                <Text style={styles.metricValue}>87%</Text>
              </View>
            </View>

            <View style={[styles.bentoCard, { flex: 1, justifyContent: 'space-between' }]}>
              <MaterialIcons name="schedule" size={22} color="#1960a6" />
              <View>
                <Text style={styles.metricLabel}>Time Saved</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={styles.metricValue}>120</Text>
                  <Text style={styles.metricUnit}>min</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bentoPrimary}>
            <View>
              <Text style={styles.punctualityLabel}>Punctuality Score</Text>
              <Text style={styles.punctualityValue}>92%</Text>
            </View>
            <CircularProgress size={64} percent={92} />
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
                <Text style={styles.legendText}>Est.</Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 14 }}>
            {CHART_DATA.map(item => (
              <View key={item.label} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={item.anomaly ? styles.chartLabelAnomaly : styles.chartLabel}>
                    {item.label}
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

        {/* Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightIconBox}>
            <MaterialIcons name="lightbulb" size={22} color="#1960a6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Optimización Detectada</Text>
            <Text style={[styles.insightBody, { marginTop: 4 }]}>
              Salir{' '}
              <Text style={{ fontWeight: '700', color: '#002452' }}>10 minutos antes</Text>
              {' '}los martes mejora la predictibilidad de tu ruta en un{' '}
              <Text style={{ fontWeight: '700', color: '#1960a6' }}>15%</Text>
              , evitando el cuello de botella en la Autopista Norte.
            </Text>
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
              <Text style={styles.compAvg}>42 min avg.</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialIcons name="trending-down" size={14} color="#2D751A" />
                <Text style={styles.compTrend}>-8%</Text>
              </View>
              <Text style={styles.compVsLabel}>vs. anterior</Text>
            </View>
          </View>
          <View style={[styles.compRow, { opacity: 0.6, borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.compPeriodLabel}>SEMANA PASADA</Text>
              <Text style={styles.compAvg}>46 min avg.</Text>
            </View>
            <View style={{ width: 48, height: 4, backgroundColor: '#eceef0', borderRadius: 9999 }} />
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="home" />
    </SafeAreaView>
  );
}

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

  insightCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4, borderLeftColor: '#1960a6',
    borderRadius: 8, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  insightIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#7ab3ff', flexShrink: 0,
  },
  insightTitle: { fontSize: 14, fontWeight: '700', color: '#002452' },
  insightBody: { fontSize: 14, lineHeight: 20, color: '#44474f' },

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
