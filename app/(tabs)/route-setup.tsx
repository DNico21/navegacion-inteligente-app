import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

type Transport = 'car' | 'bus' | 'tm';

const TRANSPORT_OPTIONS: { key: Transport; icon: string; label: string }[] = [
  { key: 'car', icon: 'directions-car', label: 'Carro' },
  { key: 'bus', icon: 'directions-bus', label: 'Bus' },
  { key: 'tm', icon: 'train', label: 'TM' },
];

export default function RouteSetupScreen() {
  const [origin, setOrigin] = useState('Chía');
  const [destination, setDestination] = useState('Universidad de La Sabana');
  const [arrivalTime, setArrivalTime] = useState('07:30 AM');
  const [transport, setTransport] = useState<Transport>('car');
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tu perfil de ruta</Text>
        </View>
        <Text style={styles.headerSub}>Configura una vez, listo para siempre</Text>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="info" size={20} color="#1960a6" />
          <Text style={styles.infoText}>
            Setup rápido para recomendaciones automáticas
          </Text>
        </View>

        {/* ── Field group ── */}
        <View style={styles.fieldGroup}>
          {/* Origin */}
          <View style={styles.field}>
            <Text style={styles.label}>Municipio de origen</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
              placeholder="Ej. Chía"
              placeholderTextColor="#9EA3AC"
            />
          </View>

          {/* Destination */}
          <View style={styles.field}>
            <Text style={styles.label}>Destino principal</Text>
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="Ej. Universidad de La Sabana"
              placeholderTextColor="#9EA3AC"
            />
          </View>

          {/* Arrival time */}
          <View style={styles.field}>
            <Text style={styles.label}>Hora de llegada deseada</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={arrivalTime}
                onChangeText={setArrivalTime}
                placeholder="07:30 AM"
                placeholderTextColor="#9EA3AC"
              />
              <MaterialIcons
                name="schedule"
                size={20}
                color="#747780"
                style={styles.inputEndIcon}
              />
            </View>
          </View>
        </View>

        {/* ── Transport selector ── */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de transporte</Text>
          <View style={styles.transportGrid}>
            {TRANSPORT_OPTIONS.map(({ key, icon, label }) => {
              const active = transport === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.transportCard, active && styles.transportCardActive]}
                  onPress={() => setTransport(key)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={icon as any}
                    size={28}
                    color={active ? '#1B3A6B' : '#747780'}
                  />
                  <Text style={[styles.transportLabel, active && styles.transportLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Notifications card ── */}
        <View style={styles.notifCard}>
          <View style={styles.notifLeft}>
            <View style={styles.notifIconBox}>
              <MaterialIcons name="notifications-active" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.notifTitle}>Notificaciones activas</Text>
              <Text style={styles.notifSub}>Alertas críticas activadas</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggle, notificationsOn && styles.toggleOn]}
            onPress={() => setNotificationsOn(v => !v)}
            activeOpacity={0.85}
          >
            <View style={[styles.toggleThumb, notificationsOn && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>

        {/* ── Image placeholder ── */}
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="terrain" size={48} color="#B0B8C4" />
          <Text style={styles.imagePlaceholderLabel}>Sabana Centro</Text>
          <View style={styles.imageOverlay} />
        </View>
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.profilesLink}
          activeOpacity={0.8}
          onPress={() => router.push('/route-profiles' as any)}
        >
          <MaterialIcons name="manage-accounts" size={18} color="#185FA5" />
          <Text style={styles.profilesLinkText}>Ver perfiles de ruta guardados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.88}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.ctaText}>Ver mis rutas ahora</Text>
          <MaterialIcons name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  // ── Header ──
  header: {
    backgroundColor: '#1B3A6B',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#ffffff',
  },
  headerSub: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
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

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6F1FB',
    borderLeftWidth: 4,
    borderLeftColor: '#1960a6',
    borderRadius: 8,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: '#1960a6',
  },

  // ── Form fields ──
  fieldGroup: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: '#44474f',
  },
  input: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c4c6d0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#191c1e',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  inputEndIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },

  // ── Transport selector ──
  transportGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  transportCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c4c6d0',
    borderRadius: 12,
  },
  transportCardActive: {
    backgroundColor: '#E6F1FB',
    borderWidth: 2,
    borderColor: '#1B3A6B',
  },
  transportLabel: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: '#44474f',
  },
  transportLabelActive: {
    color: '#1B3A6B',
  },

  // ── Notifications ──
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF3DE',
    borderWidth: 1,
    borderColor: 'rgba(45,117,26,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  notifLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flex: 1,
  },
  notifIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D751A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifTitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#2D751A',
  },
  notifSub: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(45,117,26,0.8)',
  },

  // Toggle switch
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c4c6d0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#2D751A',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },

  // ── Image placeholder ──
  imagePlaceholder: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4c6d0',
    backgroundColor: '#d8dadc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePlaceholderLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#9EA3AC',
    fontWeight: '500',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(27,58,107,0.3)',
  },

  // ── Footer ──
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ctaButton: {
    height: 56,
    backgroundColor: '#1B3A6B',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },
});
