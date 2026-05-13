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

// ─── Placeholder data (replace with real API data) ───────────────────────────
const SUGGESTION = {
  text: 'Sale a las 6:32 am para ahorrar 18 minutos y evitar el congestionamiento en el peaje.',
};

type ReliabilityLevel = 'low' | 'moderate' | 'high';

interface Route {
  id: number;
  badge: string;
  reliability: string;
  reliabilityLevel: ReliabilityLevel;
  name: string;
  trafficDots: string[];
  trafficLabel: string;
  time: string;
  uncertainty: string;
  distance: string;
  footer: string;
}

const ROUTES: Route[] = [
  {
    id: 1,
    badge: 'Recomendada',
    reliability: 'PREDECIBLE',
    reliabilityLevel: 'low',
    name: 'Vía Cajicá — Autopista Norte',
    trafficDots: ['#2D751A', '#c4c6d0', '#c4c6d0'],
    trafficLabel: 'Bajo tráfico',
    time: '58 min',
    uncertainty: '± 6 min',
    distance: '31 km',
    footer: 'Histórico: 52–64 min',
  },
  {
    id: 2,
    badge: 'Alternativa 1',
    reliability: 'VARIABLE',
    reliabilityLevel: 'moderate',
    name: 'Por Chía centro — Calle 19',
    trafficDots: ['#2D751A', '#8F5A12', '#c4c6d0'],
    trafficLabel: 'Tráfico moderado',
    time: '51 min',
    uncertainty: '± 18 min',
    distance: '24 km',
    footer: 'Histórico: 42–72 min',
  },
  {
    id: 3,
    badge: 'Alternativa 2',
    reliability: 'IMPREDECIBLE',
    reliabilityLevel: 'high',
    name: 'Desvío Tabio — 25N',
    trafficDots: ['#2D751A', '#8F5A12', '#B03A39'],
    trafficLabel: 'Alta volatilidad',
    time: '44 min',
    uncertainty: '± 31 min',
    distance: '38 km',
    footer: 'Incidente reportado: Peaje',
  },
];

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
  { icon: 'history', label: 'Historial', active: false, route: '/weekly-history' },
  { icon: 'account-circle', label: 'Perfil', active: false, route: '/profile' },
];

export default function TodayRoutesScreen() {
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Hora pico</Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>Chía → La Sabana · Mar 7:30 am</Text>
        </View>

        {/* Suggestion card */}
        <View style={styles.suggestionCard}>
          {/* Background icon decoration */}
          <View style={styles.suggestionBgIcon} pointerEvents="none">
            <MaterialIcons name="schedule" size={120} color="#fff" style={{ opacity: 0.1 }} />
          </View>
          <View style={styles.suggestionContent}>
            <MaterialIcons name="lightbulb" size={22} color="#fff" style={{ marginTop: 2 }} />
            <View style={styles.suggestionText}>
              <Text style={styles.suggestionTitle}>Optimización sugerida</Text>
              <Text style={styles.suggestionBody}>{SUGGESTION.text}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <Text style={styles.dividerLabel}>ORDENADO POR CONFIABILIDAD</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Route cards */}
        {ROUTES.map(route => {
          const theme = RELIABILITY_THEME[route.reliabilityLevel];
          return (
            <TouchableOpacity
              key={route.id}
              style={[styles.routeCard, { borderColor: theme.border }]}
              activeOpacity={0.88}
              onPress={() => router.push('/route-detail')}
            >
              {/* Card header stripe */}
              <View style={[styles.routeCardHeader, { backgroundColor: theme.bg }]}>
                <Text style={[styles.routeBadge, { color: theme.color }]}>
                  {route.badge}
                </Text>
                <Text style={[styles.routeReliability, { color: theme.color }]}>
                  {route.reliability}
                </Text>
              </View>

              {/* Card body */}
              <View style={styles.routeCardBody}>
                {/* Left: name + traffic */}
                <View style={styles.routeLeft}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={styles.trafficRow}>
                    <View style={styles.trafficDots}>
                      {route.trafficDots.map((color, i) => (
                        <View key={i} style={[styles.trafficDot, { backgroundColor: color }]} />
                      ))}
                    </View>
                    <Text style={styles.trafficLabel}>{route.trafficLabel}</Text>
                  </View>
                </View>

                {/* Right: time */}
                <View style={styles.routeRight}>
                  <Text style={styles.routeTime}>{route.time}</Text>
                  <Text style={styles.routeUncertainty}>{route.uncertainty}</Text>
                </View>
              </View>

              {/* Card footer */}
              <View style={styles.routeCardFooter}>
                <Text style={styles.routeFooterText}>
                  {'•  '}{route.distance}
                </Text>
                <Text style={styles.routeFooterText}>{route.footer}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

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

        {/* Map mini-view */}
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={40} color="#B0B8C4" />
          <Text style={styles.mapPlaceholderText}>Mapa de rutas</Text>
          {/* Gradient overlay simulation */}
          <View style={styles.mapOverlay} />
          <TouchableOpacity style={styles.mapButton}>
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
});
