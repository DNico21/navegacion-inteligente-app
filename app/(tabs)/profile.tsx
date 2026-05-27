import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';
import { fetchCumulativeImpact, ImpactMetrics } from '@/utils/impactService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(firstname?: string, lastname?: string): string {
  const f = (firstname ?? '').trim()[0] ?? '';
  const l = (lastname ?? '').trim()[0] ?? '';
  return (f + l).toUpperCase() || '??';
}

function getMemberSince(creationTime?: string): string {
  if (!creationTime) return 'Usuario registrado';
  const date = new Date(creationTime);
  return `Miembro desde ${date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`;
}

function getMemberLevel(timeSavedMin: number): { label: string; color: string } {
  if (timeSavedMin >= 60) return { label: 'Oro', color: '#92400E' };
  if (timeSavedMin >= 20) return { label: 'Plata', color: '#475569' };
  return { label: 'Explorador', color: '#185FA5' };
}

// ─── Edit Name Modal ──────────────────────────────────────────────────────────

interface EditNameModalProps {
  visible: boolean;
  initialName: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

function EditNameModal({ visible, initialName, onSave, onClose }: EditNameModalProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setName(initialName); }, [initialName]);

  async function handleSave() {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      Alert.alert('Nombre inválido', 'Ingresa tu nombre completo (mínimo 3 caracteres).');
      return;
    }
    setSaving(true);
    await onSave(trimmed);
    setSaving(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Editar nombre</Text>

          <Text style={styles.inputLabel}>Nombre completo</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color="#747780" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
              placeholderTextColor="#9EA3AC"
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.88}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalSaveText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Info Modal (Terms / About / Help) ────────────────────────────────────────

interface InfoModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function InfoModal({ visible, title, children, onClose }: InfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
          <View style={styles.modalHandle} />
          <View style={styles.infoModalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color="#747780" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {children}
          </ScrollView>
          <TouchableOpacity style={styles.infoModalCloseBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={styles.modalSaveText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type ActiveModal = 'editName' | 'help' | 'about' | null;

export default function ProfileScreen() {
  const { state, signOut, updateUser } = useContext(AuthContext);
  const user = state.user;

  const [notifications, setNotifications] = useState<boolean>(user?.notifications ?? true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);

  const initials = getInitials(user?.firstname, user?.lastname);
  const fullName = user?.fullName ?? (`${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() || 'Usuario');
  const email = user?.email ?? '';
  const memberSince = getMemberSince(user?.metadata?.creationTime);

  useEffect(() => {
    fetchCumulativeImpact().then(setImpact);
  }, []);

  const level = getMemberLevel(impact?.timeSavedMin ?? 0);

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => { await signOut(); router.replace('/login'); },
      },
    ]);
  }

  async function handleSaveName(newName: string) {
    const spaceIndex = newName.trim().indexOf(' ');
    const firstname = spaceIndex === -1 ? newName.trim() : newName.slice(0, spaceIndex).trim();
    const lastname = spaceIndex === -1 ? '' : newName.slice(spaceIndex + 1).trim();
    await updateUser({ firstname, lastname, fullName: newName.trim() });
  }

  function handlePasswordReset() {
    if (!email) {
      Alert.alert('Sin correo', 'No encontramos un correo asociado a tu cuenta.');
      return;
    }
    Alert.alert(
      'Restablecer contraseña',
      `Enviaremos un enlace de restablecimiento a:\n${email}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar enlace',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email);
              Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada y sigue el enlace para cambiar tu contraseña.');
            } catch {
              Alert.alert('Error', 'No pudimos enviar el correo. Inténtalo de nuevo.');
            }
          },
        },
      ],
    );
  }

  function handleComingSoon(feature: string) {
    Alert.alert('Próximamente', `"${feature}" estará disponible en la siguiente versión de la app.`);
  }

  function handleRowPress(row: SettingRow) {
    switch (row.label) {
      case 'Información Personal':
        setActiveModal('editName');
        break;
      case 'Seguridad y Contraseña':
        handlePasswordReset();
        break;
      case 'Centro de Ayuda':
        setActiveModal('help');
        break;
      case 'Acerca de Sabana Inteligente':
        setActiveModal('about');
        break;
      default:
        handleComingSoon(row.label);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={() => setActiveModal('editName')}>
              <MaterialIcons name="edit" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.profileSince}>{memberSince}</Text>
        </View>

        {/* Stats grid — real data */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="timer" size={22} color="#185FA5" />
            <Text style={styles.statValue}>
              {impact ? `${impact.safetyPercent}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>PUNTUALIDAD</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={22} color="#185FA5" />
            <Text style={styles.statValue}>
              {impact ? `${impact.timeSavedMin} min` : '—'}
            </Text>
            <Text style={styles.statLabel}>AHORRO</Text>
          </View>
          <View style={[styles.statCard, { borderColor: level.color, borderWidth: 1.5 }]}>
            <MaterialIcons name="workspace-premium" size={22} color={level.color} />
            <Text style={[styles.statValue, { color: level.color }]}>{level.label}</Text>
            <Text style={styles.statLabel}>NIVEL</Text>
          </View>
        </View>

        {/* Settings groups */}
        <View style={{ gap: 24 }}>
          {SETTING_GROUPS.map(group => (
            <View key={group.title} style={{ gap: 8 }}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupCard}>
                {group.rows.map((row, i) => renderRow(row, i, {
                  notifications,
                  onToggle: async () => {
                    const next = !notifications;
                    setNotifications(next);
                    await updateUser({ notifications: next });
                  },
                  onPress: () => handleRowPress(row),
                }))}
              </View>
            </View>
          ))}
        </View>

        {/* Logout + version */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={18} color="#ba1a1a" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Sabana Inteligente v1.0 · © 2025</Text>
        </View>
      </ScrollView>

      <BottomNavBar active="profile" />

      {/* Edit name modal */}
      <EditNameModal
        visible={activeModal === 'editName'}
        initialName={fullName}
        onSave={handleSaveName}
        onClose={() => setActiveModal(null)}
      />

      {/* Help modal */}
      <InfoModal visible={activeModal === 'help'} title="Centro de Ayuda" onClose={() => setActiveModal(null)}>
        <View style={styles.infoContent}>
          {FAQ.map(item => (
            <View key={item.q} style={styles.faqItem}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Text style={styles.faqA}>{item.a}</Text>
            </View>
          ))}
        </View>
      </InfoModal>

      {/* About modal */}
      <InfoModal visible={activeModal === 'about'} title="Acerca de" onClose={() => setActiveModal(null)}>
        <View style={styles.infoContent}>
          <View style={styles.aboutLogoBox}>
            <MaterialIcons name="navigation" size={36} color="#fff" />
          </View>
          <Text style={styles.aboutTitle}>Sabana Inteligente</Text>
          <Text style={styles.aboutVersion}>Versión 1.0 · Capstone 2025</Text>
          {ABOUT_ITEMS.map(item => (
            <View key={item.label} style={styles.aboutRow}>
              <MaterialIcons name={item.icon as any} size={18} color="#185FA5" />
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutLabel}>{item.label}</Text>
                <Text style={styles.aboutValue}>{item.value}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.aboutDisclaimer}>
            App desarrollada como proyecto de grado en la Universidad de La Sabana.
            Los datos de tráfico provienen de Google Directions API en tiempo real.
          </Text>
        </View>
      </InfoModal>
    </SafeAreaView>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

interface SettingRow {
  icon: string;
  label: string;
  sublabel?: string;
  type: 'nav' | 'toggle';
}

const SETTING_GROUPS: { title: string; rows: SettingRow[] }[] = [
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
      { icon: 'notifications-active', label: 'Notificaciones Inteligentes', type: 'toggle' },
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

const FAQ = [
  {
    q: '¿Cómo calcula la app el horario de salida?',
    a: 'Consulta Google Directions API en tiempo real para tu ruta. Con varias muestras calcula el tiempo promedio más un margen de incertidumbre según la variabilidad del tráfico.',
  },
  {
    q: '¿Qué significa el margen de ±X minutos?',
    a: 'Es el tiempo extra de seguridad basado en cuánto varía el tráfico en tu ruta. Un margen pequeño (verde) indica rutas predecibles; uno grande (rojo) indica alta variabilidad.',
  },
  {
    q: '¿Por qué no recibo notificaciones?',
    a: 'Verifica que las notificaciones estén activadas en Ajustes del dispositivo > Sabana Inteligente. También puedes activarlas desde Perfil > Notificaciones Inteligentes.',
  },
  {
    q: '¿Cómo se calcula el CO₂ evitado?',
    a: 'Cada minuto de margen ahorrado equivale aproximadamente a 0,06 kg de CO₂ (basado en 30 km/h promedio × 0,12 kg CO₂/km). Es una estimación conservadora para vehículo particular.',
  },
  {
    q: '¿Puedo usar la app fuera de Sabana Centro?',
    a: 'El MVP está optimizado para Chía, Cajicá, Bogotá Norte y Universidad de La Sabana. La versión completa soportará más municipios.',
  },
];

const ABOUT_ITEMS = [
  { icon: 'school', label: 'Universidad', value: 'Universidad de La Sabana' },
  { icon: 'code', label: 'Tecnología', value: 'React Native · Expo · Firebase · Google Maps' },
  { icon: 'eco', label: 'Impacto', value: 'Reducción de CO₂ y estrés en el tráfico' },
  { icon: 'support-agent', label: 'Soporte', value: 'train.myp@gmail.com' },
];

// ─── Row renderer ─────────────────────────────────────────────────────────────

function renderRow(
  row: SettingRow,
  index: number,
  ctx: { notifications: boolean; onToggle: () => void; onPress: () => void },
) {
  const isFirst = index === 0;

  if (row.type === 'toggle') {
    return (
      <View key={row.label} style={[styles.settingRow, !isFirst && styles.rowBorder]}>
        <View style={styles.rowLeft}>
          <MaterialIcons name={row.icon as any} size={22} color="#747780" />
          <Text style={styles.rowLabel}>{row.label}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, ctx.notifications && styles.toggleOn]}
          onPress={ctx.onToggle}
          activeOpacity={0.85}
        >
          <View style={[styles.toggleThumb, ctx.notifications && styles.toggleThumbOn]} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      key={row.label}
      style={[styles.settingRow, !isFirst && styles.rowBorder]}
      activeOpacity={0.7}
      onPress={ctx.onPress}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#F4F6F8', borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
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
    backgroundColor: '#1B3A6B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  profileAvatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#185FA5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  profileName: { fontSize: 20, fontWeight: '600', color: '#1B3A6B', letterSpacing: -0.2 },
  profileEmail: { fontSize: 13, color: '#185FA5', marginTop: 2 },
  profileSince: { fontSize: 13, color: '#747780', marginTop: 2 },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 12,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },
  statLabel: {
    fontSize: 9, fontWeight: '500', color: '#747780',
    letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center',
  },

  // Setting groups
  groupTitle: {
    fontSize: 12, fontWeight: '600', color: '#1B3A6B',
    letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
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
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: '#c4c6d0', justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: '#185FA5' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start' },
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

  // ── Modals ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingBottom: 32, paddingHorizontal: 20,
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#c4c6d0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  infoModalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A6B' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#44474f', marginBottom: 6, marginTop: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#C5CDD8', borderRadius: 8,
    backgroundColor: '#fff', marginBottom: 24,
  },
  textInput: { flex: 1, paddingVertical: 13, paddingHorizontal: 8, fontSize: 15, color: '#191c1e' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#C5CDD8',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#44474f' },
  modalSaveBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#1B3A6B', alignItems: 'center',
  },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  infoModalCloseBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#1B3A6B', alignItems: 'center',
  },

  // Info modal content
  infoContent: { gap: 16, paddingVertical: 4 },
  faqItem: { gap: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  faqQ: { fontSize: 14, fontWeight: '700', color: '#1B3A6B', lineHeight: 20 },
  faqA: { fontSize: 13, color: '#44474f', lineHeight: 20 },

  aboutLogoBox: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: '#1B3A6B', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  aboutTitle: { fontSize: 20, fontWeight: '700', color: '#1B3A6B', textAlign: 'center' },
  aboutVersion: { fontSize: 13, color: '#747780', textAlign: 'center', marginTop: -8 },
  aboutRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2F5',
  },
  aboutLabel: { fontSize: 11, fontWeight: '700', color: '#747780', textTransform: 'uppercase', letterSpacing: 0.5 },
  aboutValue: { fontSize: 14, color: '#191c1e', marginTop: 2 },
  aboutDisclaimer: { fontSize: 12, color: '#94A3B8', lineHeight: 18, textAlign: 'center', marginTop: 8 },
});
