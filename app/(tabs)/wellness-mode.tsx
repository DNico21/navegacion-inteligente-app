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

const NAV_TABS = [
  { icon: 'map', label: 'Map', active: false },
  { icon: 'directions-car', label: 'Routes', active: false },
  { icon: 'spa', label: 'Wellness', active: true },
  { icon: 'person', label: 'Profile', active: false },
];

export default function WellnessModeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wellness Mode</Text>
        </View>
        <TouchableOpacity hitSlop={8} onPress={() => router.push('/profile' as any)}>
          <MaterialIcons name="account-circle" size={26} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Respira, nosotros monitoreamos</Text>
          <Text style={styles.heroSub}>
            Detectamos congestión en la Variante Chía-Cajicá.
          </Text>
        </View>

        {/* Impact card */}
        <View style={styles.impactCard}>
          <View style={styles.decorCircle} />
          <View style={styles.impactContent}>
            <View style={styles.impactTimeRow}>
              <Text style={styles.impactNum}>+25</Text>
              <Text style={styles.impactUnit}>min</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={styles.impactLabel}>Tiempo extra estimado</Text>
              <Text style={styles.impactBody}>
                Sabemos que el tráfico puede ser frustrante. Aprovecha este tiempo
                para reconectar contigo mismo.
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.updateLabel}>
              TU RUTA SE ACTUALIZA AUTOMÁTICAMENTE
            </Text>
          </View>
        </View>

        {/* Quick options */}
        <View style={{ gap: 14 }}>
          {/* Breathing — full width */}
          <TouchableOpacity style={styles.breathingCard} activeOpacity={0.85} onPress={() => router.push('/guided-breathing' as any)}>
            <View style={styles.breathingLeft}>
              <View style={styles.breathingIconBox}>
                <MaterialIcons name="spa" size={30} color="#032100" />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.optionTitle}>Ejercicios de respiración</Text>
                <Text style={styles.breathingSub}>Sesión guiada de 3 min</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#747780" />
          </TouchableOpacity>

          {/* Two half cards */}
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity style={[styles.smallCard, { flex: 1 }]} activeOpacity={0.85} onPress={() => router.push('/relaxation-library' as any)}>
              <View style={[styles.smallIconBox, { backgroundColor: '#d4e3ff' }]}>
                <MaterialIcons name="playlist-play" size={22} color="#001c39" />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.optionTitle}>Playlists relajantes</Text>
                <Text style={styles.optionSub}>Curadas para conducir</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.smallCard, { flex: 1 }]} activeOpacity={0.85} onPress={() => router.push('/relaxation-library' as any)}>
              <View style={[styles.smallIconBox, { backgroundColor: '#d7e2ff' }]}>
                <MaterialIcons name="podcasts" size={22} color="#001a40" />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.optionTitle}>Podcast de 10 min</Text>
                <Text style={styles.optionSub}>Dosis de inspiración</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sabana Zen Chat */}
        <TouchableOpacity
          style={styles.zenCard}
          activeOpacity={0.85}
          onPress={() => router.push('/sabana-zen-chat' as any)}
        >
          <View style={[styles.smallIconBox, { backgroundColor: '#d4e3ff' }]}>
            <MaterialIcons name="chat" size={22} color="#001c39" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.optionTitle}>Chat Sabana Zen</Text>
            <Text style={styles.optionSub}>Tu compañero de calma con IA</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#747780" />
        </TouchableOpacity>

        {/* Featured visual */}
        <View style={styles.featuredBox}>
          <View style={styles.featuredPlaceholder}>
            <MaterialIcons name="landscape" size={44} color="#B0B8C4" />
          </View>
          <View style={[StyleSheet.absoluteFillObject, styles.featuredOverlay]} />
          <Text style={styles.featuredText}>
            Encuentra tu calma en medio del movimiento.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.navTab, tab.active && styles.navTabActive]}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={tab.active ? '#1d4ed8' : '#94a3b8'}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a5f', letterSpacing: -0.3 },

  // Scroll — light blue tinted background to simulate gradient
  scroll: { flex: 1, backgroundColor: '#EBF4FC' },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 24 },

  // Hero
  hero: { alignItems: 'center', gap: 6 },
  heroTitle: {
    fontSize: 24, fontWeight: '700', color: '#002452',
    letterSpacing: -0.5, lineHeight: 32, textAlign: 'center',
  },
  heroSub: {
    fontSize: 16, lineHeight: 24, color: '#44474f', textAlign: 'center',
  },

  // Impact card
  impactCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#c4c6d0',
    borderRadius: 12, padding: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  decorCircle: {
    position: 'absolute', top: -48, right: -48,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(122,179,255,0.12)',
  },
  impactContent: { alignItems: 'center', gap: 14 },
  impactTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  impactNum: {
    fontSize: 52, fontWeight: '700', color: '#1960a6',
    lineHeight: 56, letterSpacing: -1,
  },
  impactUnit: { fontSize: 20, fontWeight: '600', color: '#1960a6', letterSpacing: -0.3 },
  impactLabel: { fontSize: 16, fontWeight: '600', color: '#002452', lineHeight: 24 },
  impactBody: {
    fontSize: 14, lineHeight: 20, color: '#44474f',
    textAlign: 'center', maxWidth: 280,
  },
  progressTrack: {
    width: '100%', height: 4,
    backgroundColor: '#eceef0', borderRadius: 9999, overflow: 'hidden',
  },
  progressFill: { width: '66.67%', height: 4, backgroundColor: '#1960a6', borderRadius: 9999 },
  updateLabel: {
    fontSize: 11, fontWeight: '500', color: '#747780',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  // Breathing card (full width)
  breathingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#c4c6d0',
    borderRadius: 12, padding: 14,
  },
  breathingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  breathingIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#97fa77',
    alignItems: 'center', justifyContent: 'center',
  },
  breathingSub: { fontSize: 12, fontWeight: '600', color: '#105300', letterSpacing: 0.2 },

  // Small option cards
  smallCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#c4c6d0',
    borderRadius: 12, padding: 14, gap: 10,
    alignItems: 'flex-start',
  },
  zenCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#c4c6d0',
    borderRadius: 12, padding: 14,
  },
  smallIconBox: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  optionTitle: { fontSize: 14, fontWeight: '600', color: '#002452', lineHeight: 20 },
  optionSub: { fontSize: 11, fontWeight: '500', color: '#747780', letterSpacing: 0.5 },

  // Featured visual
  featuredBox: {
    height: 160, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#c4c6d0',
  },
  featuredPlaceholder: {
    flex: 1, backgroundColor: '#d8dadc',
    alignItems: 'center', justifyContent: 'center',
  },
  featuredOverlay: { backgroundColor: 'rgba(0,36,82,0.5)' },
  featuredText: {
    position: 'absolute', bottom: 16, left: 16,
    color: '#fff', fontSize: 16, fontWeight: '600',
    lineHeight: 22, maxWidth: 200,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', height: 60, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 6,
  },
  navTab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6,
  },
  navTabActive: { backgroundColor: '#eff6ff', borderRadius: 12 },
  navLabel: {
    fontWeight: '500', fontSize: 10, letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#94a3b8',
  },
  navLabelActive: { color: '#1d4ed8', fontWeight: '700' },
});
