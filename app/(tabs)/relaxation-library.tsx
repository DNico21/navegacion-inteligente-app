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

const PLAYLISTS = [
  { title: 'Rutas Lo-Fi', meta: '45 min • Calma Total', icon: 'headset' },
  { title: 'Smooth Jazz Sabana', meta: '60 min • Elegancia', icon: 'music-note' },
];

const MEDITATIONS = [
  {
    icon: 'spa',
    title: 'Respiración en el Volante',
    badgeLabel: '3 min',
    badgeBg: '#EBF5E9',
    badgeColor: '#2D751A',
  },
  {
    icon: 'self-improvement',
    title: 'Paciencia y Presencia',
    badgeLabel: '5 min',
    badgeBg: '#F8F1E8',
    badgeColor: '#8F5A12',
  },
];

const PODCASTS = [
  {
    title: 'El Futuro de la Movilidad',
    desc: 'Entrevista con expertos en tráfico local.',
    duration: '12 min',
    icon: 'podcasts',
  },
  {
    title: 'Crónicas de la Autopista',
    desc: 'Historias de los viajeros de la Sabana.',
    duration: '18 min',
    icon: 'record-voice-over',
  },
];

const NAV_TABS = [
  { icon: 'map', label: 'Map', active: false },
  { icon: 'directions-car', label: 'Routes', active: false },
  { icon: 'spa', label: 'Wellness', active: true },
  { icon: 'person', label: 'Profile', active: false },
];

export default function RelaxationLibraryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
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
        <View style={styles.heroBox}>
          <View style={styles.heroPlaceholder}>
            <MaterialIcons name="landscape" size={48} color="#B0B8C4" />
          </View>
          <View style={[StyleSheet.absoluteFillObject, styles.heroOverlay]} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Biblioteca de Relajación</Text>
            <Text style={styles.heroSub}>Tu refugio auditivo para el trayecto diario.</Text>
          </View>
        </View>

        {/* Música para el Trancón */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Música para el Trancón</Text>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            {PLAYLISTS.map(item => (
              <TouchableOpacity key={item.title} style={styles.playlistCard} activeOpacity={0.85}>
                <View style={styles.playlistThumb}>
                  <MaterialIcons name={item.icon as any} size={28} color="#44474f" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.playlistTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.playlistMeta}>{item.meta}</Text>
                </View>
                <MaterialIcons name="play-circle" size={28} color="#1960a6" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Meditación Guiada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meditación Guiada</Text>
          <View style={{ gap: 10 }}>
            {MEDITATIONS.map(item => (
              <TouchableOpacity key={item.title} style={styles.meditationCard} activeOpacity={0.85}>
                <View style={styles.meditationLeft}>
                  <View style={styles.meditationIconBox}>
                    <MaterialIcons name={item.icon as any} size={22} color="#105300" />
                  </View>
                  <View style={{ gap: 6 }}>
                    <Text style={styles.meditationTitle}>{item.title}</Text>
                    <View style={[styles.meditationBadge, { backgroundColor: item.badgeBg }]}>
                      <Text style={[styles.meditationBadgeText, { color: item.badgeColor }]}>
                        {item.badgeLabel}
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#747780" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sabana Podcasts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sabana Podcasts</Text>
          <View style={styles.podcastCard}>
            {PODCASTS.map((item, i) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.podcastRow,
                  i < PODCASTS.length - 1 && styles.podcastRowBorder,
                ]}
                activeOpacity={0.85}
              >
                <View style={styles.podcastThumb}>
                  <MaterialIcons name={item.icon as any} size={28} color="#44474f" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.podcastTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.podcastDesc} numberOfLines={1}>{item.desc}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="schedule" size={13} color="#747780" />
                    <Text style={styles.podcastDuration}>{item.duration}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.downloadBtn} hitSlop={8}>
                  <MaterialIcons name="download" size={18} color="#00447e" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
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
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 8, borderRadius: 20, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1e3a5f', letterSpacing: -0.2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 28, paddingBottom: 24 },

  // Hero
  heroBox: {
    height: 192, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#C5CDD8',
  },
  heroPlaceholder: {
    flex: 1, backgroundColor: '#d8dadc',
    alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: { backgroundColor: 'rgba(0,36,82,0.65)' },
  heroText: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  heroTitle: {
    fontSize: 24, fontWeight: '700', color: '#fff',
    letterSpacing: -0.5, lineHeight: 32,
  },
  heroSub: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  // Section
  section: { gap: 14 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#002452', letterSpacing: -0.2 },
  seeAll: { fontSize: 12, fontWeight: '600', color: '#1960a6', letterSpacing: 0.2 },

  // Playlists
  playlistCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 10,
  },
  playlistThumb: {
    width: 64, height: 64, borderRadius: 10,
    backgroundColor: '#eceef0',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  playlistTitle: { fontSize: 16, fontWeight: '600', color: '#002452', lineHeight: 22 },
  playlistMeta: { fontSize: 11, fontWeight: '500', color: '#747780', letterSpacing: 0.5, marginTop: 2 },

  // Meditation
  meditationCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 14,
  },
  meditationLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  meditationIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#7cdd5e',
    alignItems: 'center', justifyContent: 'center',
  },
  meditationTitle: { fontSize: 16, fontWeight: '600', color: '#002452', lineHeight: 22 },
  meditationBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start',
  },
  meditationBadgeText: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
  },

  // Podcasts
  podcastCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, overflow: 'hidden',
  },
  podcastRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  podcastRowBorder: { borderBottomWidth: 1, borderBottomColor: '#C5CDD8' },
  podcastThumb: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: '#eceef0',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  podcastTitle: { fontSize: 16, fontWeight: '600', color: '#002452', lineHeight: 22 },
  podcastDesc: { fontSize: 14, lineHeight: 20, color: '#44474f' },
  podcastDuration: { fontSize: 11, fontWeight: '500', color: '#747780', letterSpacing: 0.5 },
  downloadBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#7ab3ff',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
