import { useState } from 'react';
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

// ─── Placeholder data ──────────────────────────────────────────────────────────
type ProfileKey = 'casa' | 'trabajo' | 'universidad';

const PROFILES: { key: ProfileKey; icon: string; label: string }[] = [
  { key: 'casa', icon: 'home', label: 'Casa' },
  { key: 'trabajo', icon: 'work', label: 'Trabajo' },
  { key: 'universidad', icon: 'school', label: 'Universidad' },
];

const STOPS = [
  { icon: 'local-cafe', name: 'Starbucks Fontanar', detail: 'Desvío de +4 min' },
  { icon: 'local-gas-station', name: 'Terpel Davinci', detail: 'En la ruta principal' },
];

interface SettingItem {
  icon: string;
  label: string;
  subtitle: string | null;
  key: keyof SettingsState;
}

interface SettingsState {
  avoidTolls: boolean;
  ecoRoute: boolean;
  predictiveAlerts: boolean;
}

const SETTINGS_CONFIG: SettingItem[] = [
  { icon: 'toll', label: 'Evitar peajes', subtitle: null, key: 'avoidTolls' },
  { icon: 'eco', label: 'Ruta más ecológica', subtitle: '-15% emisiones', key: 'ecoRoute' },
  { icon: 'notifications-active', label: 'Alertas predictivas', subtitle: null, key: 'predictiveAlerts' },
];

const NAV_TABS = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'directions-car', label: 'Routes', active: false },
  { icon: 'star', label: 'Favorites', active: false },
  { icon: 'settings', label: 'Settings', active: true },
];

export default function RouteProfilesScreen() {
  const [activeProfile, setActiveProfile] = useState<ProfileKey>('casa');
  const [settings, setSettings] = useState<SettingsState>({
    avoidTolls: true,
    ecoRoute: false,
    predictiveAlerts: true,
  });

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="menu" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Profiles</Text>
        </View>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={20} color="rgba(0,0,0,0.4)" />
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileSwitcher}
        >
          {PROFILES.map(p => {
            const active = activeProfile === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.profilePill, active && styles.profilePillActive]}
                onPress={() => setActiveProfile(p.key)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={p.icon as any}
                  size={16}
                  color={active ? '#fff' : '#44474f'}
                />
                <Text style={[styles.profilePillText, active && styles.profilePillTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Setup banner */}
        <View style={styles.setupBanner}>
          <MaterialIcons name="bolt" size={22} color="#002452" style={{ marginTop: 2 }} />
          <View style={styles.setupBannerContent}>
            <Text style={styles.setupBannerTitle}>JTBD Setup rápido</Text>
            <Text style={styles.setupBannerBody}>
              Optimiza tu perfil para recibir alertas inteligentes basadas en tu horario de salida
              habitual y puntos de interés.
            </Text>
            <View style={styles.setupBannerFooter}>
              <View style={styles.setupProgressBadge}>
                <Text style={styles.setupProgressText}>85% Completo</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.setupFinishLink}>Finalizar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active profile card */}
        <View style={styles.profileCard}>
          {/* Map area */}
          <View style={styles.mapArea}>
            <MaterialIcons name="map" size={48} color="#B0B8C4" />
            <Text style={styles.mapAreaText}>Mapa de ruta activa</Text>
            {/* Active route pill */}
            <View style={styles.activeRoutePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activeRouteText}>Ruta activa: Chía → Bogotá</Text>
            </View>
          </View>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>TIEMPO ESTIMADO</Text>
              <Text style={styles.statValue}>42 min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>PREDICTIBILIDAD</Text>
              <View style={styles.predictabilityBadge}>
                <Text style={styles.predictabilityText}>Alta</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Paradas frecuentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="location-on" size={22} color="#1960a6" />
              <Text style={styles.sectionTitle}>Paradas Frecuentes</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Gestionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stopsList}>
            {STOPS.map(stop => (
              <View key={stop.name} style={styles.stopCard}>
                <View style={styles.stopIconBox}>
                  <MaterialIcons name={stop.icon as any} size={22} color="#1960a6" />
                </View>
                <View>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  <Text style={styles.stopDetail}>{stop.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ajustes avanzados */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="tune" size={22} color="#1960a6" />
            <Text style={styles.sectionTitle}>Ajustes Avanzados</Text>
          </View>

          <View style={styles.settingsCard}>
            {SETTINGS_CONFIG.map((item, idx) => (
              <View
                key={item.key}
                style={[
                  styles.settingRow,
                  idx < SETTINGS_CONFIG.length - 1 && styles.settingRowBorder,
                ]}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name={item.icon as any} size={22} color="#44474f" />
                  <View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, settings[item.key] && styles.toggleOn]}
                  onPress={() => toggleSetting(item.key)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.toggleThumb, settings[item.key] && styles.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.navTab, tab.active && styles.navTabActive]}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1,
    borderBottomColor: '#C5CDD8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 6,
    borderRadius: 9999,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1B3A6B',
    letterSpacing: -0.2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c4c6d0',
    backgroundColor: '#e6e8ea',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 24,
  },

  // Profile switcher
  profileSwitcher: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    backgroundColor: '#fff',
  },
  profilePillActive: {
    backgroundColor: '#1b3a6b',
    borderColor: '#1b3a6b',
    shadowColor: '#1b3a6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePillText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#44474f',
  },
  profilePillTextActive: {
    color: '#fff',
  },

  // Setup banner
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#d7e2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#002452',
    borderRadius: 8,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    padding: 16,
  },
  setupBannerContent: {
    flex: 1,
    gap: 4,
  },
  setupBannerTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#002452',
  },
  setupBannerBody: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#294678',
  },
  setupBannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  setupProgressBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  setupProgressText: {
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#002452',
  },
  setupFinishLink: {
    fontWeight: '700',
    fontSize: 12,
    color: '#002452',
    textDecorationLine: 'underline',
  },

  // Active profile card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mapArea: {
    height: 192,
    backgroundColor: '#d8dadc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapAreaText: {
    fontSize: 12,
    color: '#9EA3AC',
    fontWeight: '500',
  },
  activeRoutePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#C5CDD8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7cdd5e',
  },
  activeRouteText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#191c1e',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
  },
  statBlock: {
    flex: 1,
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#c4c6d0',
    marginHorizontal: 16,
  },
  statLabel: {
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#44474f',
    textTransform: 'uppercase',
  },
  statValue: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: '#002452',
  },
  predictabilityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBF5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  predictabilityText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#2D751A',
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: '#002452',
  },
  sectionAction: {
    fontWeight: '600',
    fontSize: 12,
    color: '#002452',
    letterSpacing: 0.3,
  },

  // Stops
  stopsList: {
    gap: 10,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C5CDD8',
    borderRadius: 12,
    padding: 12,
  },
  stopIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopName: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#191c1e',
  },
  stopDetail: {
    fontWeight: '600',
    fontSize: 12,
    color: '#44474f',
    letterSpacing: 0.3,
  },

  // Settings
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#c4c6d0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#191c1e',
  },
  settingSubtitle: {
    fontWeight: '500',
    fontSize: 11,
    color: '#0c4500',
    marginTop: 1,
  },

  // Toggle
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e3e5',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#1960a6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
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
  },
  navTabActive: {
    borderRadius: 10,
  },
  navLabel: {
    fontWeight: '500',
    fontSize: 11,
    color: '#64748b',
  },
  navLabelActive: {
    color: '#185FA5',
    fontWeight: '700',
  },
});
