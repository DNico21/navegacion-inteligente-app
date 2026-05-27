import { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface SettingRow {
  icon: string;
  label: string;
  sublabel?: string;
  type: 'nav' | 'toggle';
  toggleKey?: 'notifications';
}

interface SettingGroup {
  title: string;
  rows: SettingRow[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'CUENTA',
    rows: [
      { icon: 'person-outline', label: 'Información Personal', type: 'nav' },
      { icon: 'lock-open', label: 'Seguridad y Contraseña', type: 'nav' },
    ],
  },
  {
    title: 'PREFERENCIAS',
    rows: [
      { icon: 'notifications-active', label: 'Notificaciones Inteligentes', type: 'toggle', toggleKey: 'notifications' },
      { icon: 'directions-car', label: 'Modo de Transporte Predeterminado', sublabel: 'Carro', type: 'nav' },
      { icon: 'straighten', label: 'Unidades de Medida', type: 'nav' },
    ],
  },
  {
    title: 'BIENESTAR EN RUTA',
    rows: [
      { icon: 'spa', label: 'Configuración de Meditación', type: 'nav' },
      { icon: 'schedule', label: 'Recordatorios de Pausa', type: 'nav' },
    ],
  },
  {
    title: 'SOPORTE',
    rows: [
      { icon: 'help-outline', label: 'Centro de Ayuda', type: 'nav' },
      { icon: 'info', label: 'Acerca de Sabana Inteligente', type: 'nav' },
    ],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

function getInitials(firstname?: string, lastname?: string): string {
  const f = (firstname ?? '').trim()[0] ?? '';
  const l = (lastname ?? '').trim()[0] ?? '';
  return (f + l).toUpperCase() || '?';
}

function getMemberSince(creationTime?: string): string {
  if (!creationTime) return 'Usuario registrado';
  const date = new Date(creationTime);
  return `Usuario desde ${date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`;
}

export default function ProfileScreen() {
  const { state, signOut, updateUser } = useContext(AuthContext);
  const user = state.user;
  const [notifications, setNotifications] = useState<boolean>(user?.notifications ?? true);

  const initials = getInitials(user?.firstname, user?.lastname);
  const fullName = user?.fullName ?? (`${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() || 'Usuario');
  const email = user?.email ?? '';
  const memberSince = getMemberSince(user?.metadata?.creationTime);

  async function handleSignOut() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

  function renderRow(row: SettingRow, index: number) {
    const isFirst = index === 0;

    if (row.type === 'toggle') {
      const on = row.toggleKey === 'notifications' ? notifications : false;
      const setOn = row.toggleKey === 'notifications'
        ? async () => {
            const next = !notifications;
            setNotifications(next);
            await updateUser({ notifications: next });
          }
        : () => {};

      return (
        <View key={row.label} style={[styles.settingRow, !isFirst && styles.rowBorder]}>
          <View style={styles.rowLeft}>
            <MaterialIcons name={row.icon as any} size={22} color="#747780" />
            <Text style={styles.rowLabel}>{row.label}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, on && styles.toggleOn]}
            onPress={setOn}
            activeOpacity={0.85}
          >
            <View style={[styles.toggleThumb, on && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={row.label}
        style={[styles.settingRow, !isFirst && styles.rowBorder]}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <MaterialIcons name={row.icon as any} size={22} color="#747780" />
          <View>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.sublabel && <Text style={styles.rowSublabel}>{row.sublabel}</Text>}
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color="#747780" />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
        <TouchableOpacity hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="settings" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
              <MaterialIcons name="edit" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.profileSince}>{memberSince}</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="timer" size={22} color="#185FA5" />
            <Text style={styles.statValue}>92%</Text>
            <Text style={styles.statLabel}>PUNTUALIDAD</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={22} color="#185FA5" />
            <Text style={styles.statValue}>120 min</Text>
            <Text style={styles.statLabel}>AHORRO</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="workspace-premium" size={22} color="#185FA5" />
            <Text style={styles.statValue}>Oro</Text>
            <Text style={styles.statLabel}>NIVEL</Text>
          </View>
        </View>

        {/* Settings groups */}
        <View style={{ gap: 24 }}>
          {SETTING_GROUPS.map(group => (
            <View key={group.title} style={{ gap: 8 }}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupCard}>
                {group.rows.map((row, i) => renderRow(row, i))}
              </View>
            </View>
          ))}
        </View>

        {/* Logout + version */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleSignOut}
          >
            <MaterialIcons name="logout" size={18} color="#ba1a1a" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v1.4.2</Text>
        </View>
      </ScrollView>

      <BottomNavBar active="profile" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 20, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 28, paddingBottom: 24 },

  // Profile hero
  profileHero: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  profileAvatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#1B3A6B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  profileAvatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#185FA5',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  profileName: { fontSize: 20, fontWeight: '600', color: '#1B3A6B', letterSpacing: -0.2 },
  profileEmail: { fontSize: 13, color: '#185FA5', marginTop: 2 },
  profileSince: { fontSize: 13, color: '#747780', marginTop: 2 },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 12,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },
  statLabel: {
    fontSize: 10, fontWeight: '500', color: '#747780',
    letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center',
  },

  // Setting groups
  groupTitle: {
    fontSize: 12, fontWeight: '600', color: '#1B3A6B',
    letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#C5CDD8' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowLabel: { fontSize: 16, lineHeight: 24, color: '#191c1e' },
  rowSublabel: { fontSize: 12, fontWeight: '600', color: '#185FA5', marginTop: 1 },

  // Toggle
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: '#c4c6d0', justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: '#185FA5' },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Footer
  footer: { gap: 14, alignItems: 'center' },
  logoutBtn: {
    width: '100%', paddingVertical: 16,
    backgroundColor: 'rgba(186,26,26,0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(186,26,26,0.2)',
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ba1a1a' },
  version: { fontSize: 11, fontWeight: '500', color: '#747780', letterSpacing: 0.5 },

});
