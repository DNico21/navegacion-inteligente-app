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

// ─── Placeholder data (replace with real API / route params) ──────────────────
const ROUTE = {
  name: 'Vía Cajicá — Autopista Norte',
  description: 'Ruta principal optimizada por tráfico',
  confidence: 'Alta',
  time: '58 min',
  margin: '± 6 min',
};

const STRESS = {
  level: 'Medio',
  detail: 'Flujo constante con alta densidad',
  percent: 0.65,
};

const WELLBEING = [
  {
    icon: 'headset',
    title: 'Escuchar Lo-Fi Relax',
    subtitle: 'Música binaural para concentración',
  },
  {
    icon: 'air',
    title: 'Respiración rápida',
    subtitle: 'Técnica 4-7-8 para calmar nervios',
  },
  {
    icon: 'auto-awesome',
    title: 'Afirmación de calma',
    subtitle: 'Enfoque mental positivo hoy',
  },
];

const NAV_TABS = [
  { icon: 'explore', label: 'Explorar', active: false },
  { icon: 'directions-car', label: 'Mis Rutas', active: true },
  { icon: 'notifications', label: 'Alertas', active: false },
  { icon: 'account-circle', label: 'Perfil', active: false },
];

export default function RouteDetailScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
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

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map placeholder */}
        <View style={styles.mapBox}>
          <View style={styles.mapPlaceholderInner}>
            <MaterialIcons name="map" size={48} color="#B0B8C4" />
            <Text style={styles.mapPlaceholderText}>Visualización de ruta</Text>
          </View>
          <View style={styles.mapPill}>
            <MaterialIcons name="my-location" size={13} color="#1960a6" />
            <Text style={styles.mapPillText}>En tiempo real</Text>
          </View>
        </View>

        {/* Main route card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardTop}>
            <View style={styles.routeCardTopLeft}>
              <Text style={styles.routeName}>{ROUTE.name}</Text>
              <Text style={styles.routeDesc}>{ROUTE.description}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>Confianza: {ROUTE.confidence}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIEMPO ESTIMADO</Text>
              <Text style={styles.statValuePrimary}>{ROUTE.time}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MARGEN DE ERROR</Text>
              <Text style={styles.statValueSecondary}>{ROUTE.margin}</Text>
            </View>
          </View>
        </View>

        {/* Stress analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={22} color="#1960a6" />
            <Text style={styles.sectionTitle}>Análisis de Estrés de Tráfico</Text>
          </View>

          <View style={styles.stressCard}>
            <View style={styles.stressCardTop}>
              <View style={styles.stressIconCircle}>
                <MaterialIcons name="speed" size={24} color="#8F5A12" />
              </View>
              <View>
                <Text style={styles.stressLevel}>Nivel detectado: {STRESS.level}</Text>
                <Text style={styles.stressDetail}>{STRESS.detail}</Text>
              </View>
            </View>
            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${STRESS.percent * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Wellbeing suggestions */}
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

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.88}>
          <MaterialIcons name="navigation" size={22} color="#fff" />
          <Text style={styles.ctaText}>Iniciar Navegación</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Navigation Bar ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.navTab, tab.active && styles.navTabActive]}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={tab.active ? '#185FA5' : '#94a3b8'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1,
    borderBottomColor: '#C5CDD8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1B3A6B',
    letterSpacing: -0.2,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 24,
  },

  // Map
  mapBox: {
    height: 192,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    backgroundColor: '#d8dadc',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderInner: {
    alignItems: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: '#9EA3AC',
    fontWeight: '500',
  },
  mapPill: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#c4c6d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  mapPillText: {
    fontWeight: '500',
    fontSize: 11,
    color: '#1960a6',
    letterSpacing: 0.5,
  },

  // Route card
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    padding: 16,
    gap: 16,
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeCardTopLeft: {
    flex: 1,
    gap: 4,
  },
  routeName: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: '#1b3a6b',
  },
  routeDesc: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#44474f',
  },
  confidenceBadge: {
    backgroundColor: '#EBF5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    flexShrink: 0,
  },
  confidenceText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#2D751A',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f6',
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#747780',
    textTransform: 'uppercase',
  },
  statValuePrimary: {
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: '#1b3a6b',
  },
  statValueSecondary: {
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: '#1960a6',
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#191c1e',
  },

  // Stress card
  stressCard: {
    backgroundColor: '#F8F1E8',
    borderLeftWidth: 4,
    borderLeftColor: '#8F5A12',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    padding: 16,
    gap: 12,
  },
  stressCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stressIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#F8F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stressLevel: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#8F5A12',
  },
  stressDetail: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#8F5A12',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#8F5A12',
  },

  // Wellbeing cards
  wellbeingList: {
    gap: 10,
  },
  wellbeingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C5CDD8',
    borderRadius: 12,
    padding: 16,
  },
  wellbeingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  wellbeingText: {
    flex: 1,
    gap: 2,
  },
  wellbeingTitle: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#1b3a6b',
    letterSpacing: 0.3,
  },
  wellbeingSubtitle: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
    color: '#747780',
    letterSpacing: 0.5,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#185FA5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#C5CDD8',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  navTabActive: {
    borderRadius: 10,
  },
  navLabel: {
    fontWeight: '500',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  navLabelActive: {
    color: '#185FA5',
    fontWeight: '700',
  },
});
