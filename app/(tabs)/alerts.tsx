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

const HISTORY_CARDS = [
  {
    dayAbbr: 'Mon',
    dayNum: '12',
    title: 'Cajicá road closure',
    desc: 'Maintenance work completed.',
    badge: null as string | null,
  },
  {
    dayAbbr: 'Fri',
    dayNum: '09',
    title: 'Normal traffic',
    desc: 'Steady flow on all main sectors.',
    badge: 'Predictable' as string | null,
  },
];

const NAV_TABS = [
  { icon: 'home', label: 'Inicio', active: false, route: '/' },
  { icon: 'notifications', label: 'Alertas', active: true, route: null },
  { icon: 'history', label: 'Historial', active: false, route: '/weekly-history' },
  { icon: 'account-circle', label: 'Perfil', active: false, route: '/profile' },
];

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Dark blue header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <MaterialIcons name="navigation" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Sabana Centro</Text>
          </View>
          <Text style={styles.headerSub}>Notificaciones inteligentes</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/profile' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.avatarText}>DN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <View style={styles.pageTitleRow}>
          <Text style={styles.pageTitle}>Alertas</Text>
          <MaterialIcons name="tune" size={24} color="#1960a6" />
        </View>

        {/* Push notification card */}
        <View style={styles.pushCard}>
          <View style={styles.pushCardTop}>
            <View style={styles.nowBadge}>
              <Text style={styles.nowBadgeText}>AHORA MISMO</Text>
            </View>
            <MaterialIcons name="notifications-active" size={22} color="rgba(255,255,255,0.6)" />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={styles.pushTitle}>Sale en 30 min — Hoy a las 6:32 am</Text>
            <Text style={styles.pushBody}>Ruta Autopista predecible today (±6 min)</Text>
          </View>
          <View style={styles.pushDivider} />
          <View style={styles.pushActions}>
            <TouchableOpacity style={styles.pushBtnPrimary} activeOpacity={0.85}>
              <Text style={styles.pushBtnPrimaryText}>Ver Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pushBtnSecondary} activeOpacity={0.85}>
              <Text style={styles.pushBtnSecondaryText}>Posponer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Anomaly banner */}
        <View style={styles.anomalyBanner}>
          <View style={{ marginTop: 4 }}>
            <View style={styles.anomalyDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.anomalyTitle}>Anomalía detectada — Ruta Calle 19</Text>
            <Text style={styles.anomalyBody}>
              Tráfico 47% más lento de lo habitual por accidente menor.
            </Text>
          </View>
          <MaterialIcons name="warning" size={22} color="#ba1a1a" />
        </View>

        {/* History section header */}
        <View style={styles.historyDivider}>
          <Text style={styles.historyDividerLabel}>HISTORIAL RECIENTE</Text>
        </View>

        {/* History cards */}
        <View style={{ gap: 12 }}>
          {HISTORY_CARDS.map(card => (
            <View key={card.title} style={styles.historyCard}>
              <View style={styles.historyDateBox}>
                <Text style={styles.historyDayAbbr}>{card.dayAbbr}</Text>
                <Text style={styles.historyDayNum}>{card.dayNum}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{card.title}</Text>
                <Text style={styles.historyDesc}>{card.desc}</Text>
              </View>
              {card.badge ? (
                <View style={styles.predictBadge}>
                  <Text style={styles.predictBadgeText}>{card.badge}</Text>
                </View>
              ) : (
                <MaterialIcons name="chevron-right" size={22} color="#747780" />
              )}
            </View>
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.85}>
          <MaterialIcons name="share" size={22} color="#1b3a6b" />
          <Text style={styles.shareButtonText}>Compartir ruta actual por WhatsApp</Text>
        </TouchableOpacity>

        {/* Map placeholder */}
        <View style={styles.mapBox}>
          <View style={styles.mapPlaceholder}>
            <MaterialIcons name="map" size={44} color="#B0B8C4" />
          </View>
          <View style={styles.mapOverlay} />
          <View style={styles.mapPill}>
            <View style={styles.mapLiveDot} />
            <Text style={styles.mapPillText}>MONITOREO EN VIVO: SABANA</Text>
          </View>
        </View>
      </ScrollView>

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
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  // Dark blue header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1B3A6B',
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 88,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 15, fontWeight: '400', color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 24 },

  // Page title row
  pageTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#191c1e', letterSpacing: -0.5 },

  // Push notification card
  pushCard: {
    backgroundColor: '#1b3a6b',
    borderRadius: 12, padding: 16, gap: 12,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
    overflow: 'hidden',
  },
  pushCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowBadge: {
    backgroundColor: '#1960a6',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 9999,
  },
  nowBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  pushTitle: { fontSize: 20, fontWeight: '600', color: '#fff', lineHeight: 28, letterSpacing: -0.3 },
  pushBody: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  pushDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  pushActions: { flexDirection: 'row', gap: 12 },
  pushBtnPrimary: {
    flex: 1, backgroundColor: '#fff',
    paddingVertical: 10, borderRadius: 8,
    alignItems: 'center',
  },
  pushBtnPrimaryText: { fontSize: 12, fontWeight: '600', color: '#1b3a6b', letterSpacing: 0.2 },
  pushBtnSecondary: {
    flex: 1,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 10, borderRadius: 8,
    alignItems: 'center',
  },
  pushBtnSecondaryText: { fontSize: 12, fontWeight: '600', color: '#fff', letterSpacing: 0.2 },

  // Anomaly banner
  anomalyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#FCECEC',
    borderLeftWidth: 4, borderLeftColor: '#ba1a1a',
    borderRadius: 8, padding: 14,
  },
  anomalyDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#ba1a1a',
  },
  anomalyTitle: {
    fontSize: 16, fontWeight: '600', color: '#ba1a1a', lineHeight: 22,
  },
  anomalyBody: {
    fontSize: 14, lineHeight: 20, color: 'rgba(186,26,26,0.8)', marginTop: 2,
  },

  // History section divider
  historyDivider: {
    borderBottomWidth: 1, borderBottomColor: '#c4c6d0', paddingBottom: 8,
  },
  historyDividerLabel: {
    fontSize: 12, fontWeight: '600', color: '#44474f',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // History cards
  historyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 14,
  },
  historyDateBox: {
    width: 48, height: 48,
    backgroundColor: '#eceef0',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  historyDayAbbr: {
    fontSize: 10, fontWeight: '700', color: '#44474f',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  historyDayNum: { fontSize: 20, fontWeight: '600', color: '#002452', lineHeight: 26 },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#191c1e', lineHeight: 22 },
  historyDesc: { fontSize: 14, color: '#44474f', lineHeight: 20, marginTop: 2 },
  predictBadge: {
    backgroundColor: '#EBF5E9',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4,
  },
  predictBadgeText: { fontSize: 10, fontWeight: '700', color: '#2D751A', textTransform: 'uppercase' },

  // Share button
  shareButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 2, borderColor: '#1b3a6b',
    borderRadius: 12, paddingVertical: 16,
  },
  shareButtonText: { fontSize: 16, fontWeight: '600', color: '#1b3a6b' },

  // Map placeholder
  mapBox: {
    height: 160, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#C5CDD8',
  },
  mapPlaceholder: {
    flex: 1, backgroundColor: '#d8dadc',
    alignItems: 'center', justifyContent: 'center',
  },
  mapOverlay: {
    position: 'absolute', inset: 0, bottom: 0, left: 0, right: 0, height: 160,
    backgroundColor: 'rgba(0,36,82,0.35)',
  },
  mapPill: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  mapLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  mapPillText: {
    fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.8,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', height: 64, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#C5CDD8', paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 8,
  },
  navTab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 8,
  },
  navTabActive: { backgroundColor: '#F0F7FF', borderRadius: 12 },
  navLabel: {
    fontWeight: '500', fontSize: 10, letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#94a3b8',
  },
  navLabelActive: { color: '#185FA5', fontWeight: '700' },
});
