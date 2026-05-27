import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchCumulativeImpact, ImpactMetrics } from '@/utils/impactService';

const EMPTY: ImpactMetrics = { timeSavedMin: 0, co2SavedKg: 0, safetyPercent: 0, totalTrips: 0 };

interface PillarProps {
  icon: string;
  label: string;
  dimension: string;
  value: string;
  unit: string;
  iconBg: string;
  iconColor: string;
  valuColor: string;
  bg: string;
  border: string;
}

function Pillar({ icon, label, dimension, value, unit, iconBg, iconColor, valuColor, bg, border }: PillarProps) {
  return (
    <View style={[styles.pillar, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.pillarIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.pillarDimension}>{dimension}</Text>
      <View style={styles.pillarValueRow}>
        <Text style={[styles.pillarValue, { color: valuColor }]}>{value}</Text>
        <Text style={[styles.pillarUnit, { color: valuColor }]}>{unit}</Text>
      </View>
      <Text style={styles.pillarLabel}>{label}</Text>
    </View>
  );
}

export default function TripleImpactCard() {
  const [metrics, setMetrics] = useState<ImpactMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCumulativeImpact().then(m => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  const hasData = metrics.totalTrips > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={() => router.push('/weekly-history' as any)}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <MaterialIcons name="public" size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>TRIPLE IMPACTO</Text>
        </View>
        <View style={styles.tripsBadge}>
          {loading ? (
            <ActivityIndicator size={10} color="#185FA5" />
          ) : (
            <Text style={styles.tripsBadgeText}>
              {hasData ? `${metrics.totalTrips} viaje${metrics.totalTrips !== 1 ? 's' : ''}` : 'Sin datos aún'}
            </Text>
          )}
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {hasData
          ? 'Tu impacto acumulado desde que empezaste a usar la app'
          : 'Planifica tu primer viaje para ver tu impacto real'}
      </Text>

      {/* Three pillars */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#185FA5" />
        </View>
      ) : (
        <View style={styles.pillarsRow}>
          <Pillar
            icon="eco"
            dimension="AMBIENTAL"
            value={metrics.co2SavedKg.toString()}
            unit="kg"
            label="CO₂ evitado"
            iconBg="#D1FAE5"
            iconColor="#065F46"
            valuColor="#065F46"
            bg="#F0FAF5"
            border="#6EE7B7"
          />
          <Pillar
            icon="schedule"
            dimension="SOCIAL"
            value={metrics.timeSavedMin >= 60
              ? `${Math.floor(metrics.timeSavedMin / 60)}h ${metrics.timeSavedMin % 60}m`
              : `${metrics.timeSavedMin}`}
            unit={metrics.timeSavedMin >= 60 ? '' : 'min'}
            label="tiempo recuperado"
            iconBg="#DBEAFE"
            iconColor="#1E40AF"
            valuColor="#1E40AF"
            bg="#EFF6FF"
            border="#93C5FD"
          />
          <Pillar
            icon="shield"
            dimension="SEGURIDAD"
            value={hasData ? `${metrics.safetyPercent}` : '—'}
            unit={hasData ? '%' : ''}
            label="rutas predecibles"
            iconBg="#FEF3C7"
            iconColor="#92400E"
            valuColor="#92400E"
            bg="#FFFBEB"
            border="#FCD34D"
          />
        </View>
      )}

      {/* Footer link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ver historial detallado</Text>
        <MaterialIcons name="chevron-right" size={16} color="#185FA5" />
      </View>

      {/* Methodology note */}
      {hasData && (
        <Text style={styles.methodology}>
          CO₂: 30 km/h × 0,12 kg/km por min ahorrado · Rutas predecibles: margen ≤ 10 min
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C5CDD8',
    overflow: 'hidden',
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B3A6B',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#fff',
  },
  tripsBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 40,
    alignItems: 'center',
  },
  tripsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // ── Subtitle ──
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    lineHeight: 16,
  },

  // ── Loading ──
  loadingRow: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Pillars ──
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  pillar: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 4,
    alignItems: 'flex-start',
  },
  pillarIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pillarDimension: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94A3B8',
  },
  pillarValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    flexWrap: 'wrap',
  },
  pillarValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  pillarUnit: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 26,
  },
  pillarLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 13,
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#185FA5',
  },

  // ── Methodology ──
  methodology: {
    fontSize: 9,
    color: '#94A3B8',
    paddingHorizontal: 14,
    paddingBottom: 10,
    lineHeight: 13,
    marginTop: -6,
  },
});
