import { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RouteContext } from '@/context/RouteContext/RouteContext';
import { SABANA_LOCATIONS, LocationPoint, DEFAULT_ORIGIN, DEFAULT_DESTINATION } from '@/constants/locations';
import { logEvent } from '@/utils/analyticsService';

type Transport = 'car' | 'bus' | 'tm';

const TRANSPORT_OPTIONS: { key: Transport; icon: string; label: string }[] = [
  { key: 'car', icon: 'directions-car', label: 'Carro' },
  { key: 'bus', icon: 'directions-bus', label: 'Bus' },
  { key: 'tm', icon: 'train', label: 'TM' },
];

type PickerTarget = 'origin' | 'destination' | null;

export default function RouteSetupScreen() {
  const { setOrigin, setDestination, fetchRoutes } = useContext(RouteContext);

  const [origin, setLocalOrigin] = useState<LocationPoint>(DEFAULT_ORIGIN);
  const [destination, setLocalDestination] = useState<LocationPoint>(DEFAULT_DESTINATION);
  const [transport, setTransport] = useState<Transport>('car');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectLocation = (location: LocationPoint) => {
    if (pickerTarget === 'origin') setLocalOrigin(location);
    else setLocalDestination(location);
    setPickerTarget(null);
  };

  const handleSubmit = async () => {
    if (origin.id === destination.id) {
      Alert.alert('Origen y destino iguales', 'Selecciona ubicaciones diferentes para calcular la ruta.');
      return;
    }
    setLoading(true);
    setOrigin(origin);
    setDestination(destination);
    await fetchRoutes();
    logEvent('route_search', { originId: origin.id, destinationId: destination.id });
    setLoading(false);
    router.replace('/route-detail');
  };

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
            Selecciona tu origen y destino para calcular las mejores rutas
          </Text>
        </View>

        {/* ── Field group ── */}
        <View style={styles.fieldGroup}>
          {/* Origin picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Municipio de origen</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setPickerTarget('origin')}
              activeOpacity={0.85}
            >
              <View style={styles.locationSelectorLeft}>
                <View style={[styles.dot, { backgroundColor: '#2D751A' }]} />
                <View style={styles.locationSelectorText}>
                  <Text style={styles.locationSelectorLabel}>{origin.label}</Text>
                  <Text style={styles.locationSelectorSub}>{origin.sublabel}</Text>
                </View>
              </View>
              <MaterialIcons name="expand-more" size={22} color="#747780" />
            </TouchableOpacity>
          </View>

          {/* Route line connector */}
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
          </View>

          {/* Destination picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Destino principal</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setPickerTarget('destination')}
              activeOpacity={0.85}
            >
              <View style={styles.locationSelectorLeft}>
                <View style={[styles.dot, { backgroundColor: '#1B3A6B' }]} />
                <View style={styles.locationSelectorText}>
                  <Text style={styles.locationSelectorLabel}>{destination.label}</Text>
                  <Text style={styles.locationSelectorSub}>{destination.sublabel}</Text>
                </View>
              </View>
              <MaterialIcons name="expand-more" size={22} color="#747780" />
            </TouchableOpacity>
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

        {/* ── Route summary card ── */}
        <View style={styles.summaryCard}>
          <MaterialIcons name="route" size={20} color="#185FA5" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
              {origin.label.split(' ')[0]} → {destination.label.split(' ')[0]}
            </Text>
            <Text style={styles.summarySub}>
              Ruta configurada · Transporte: {
                TRANSPORT_OPTIONS.find(t => t.key === transport)?.label
              }
            </Text>
          </View>
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
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
          activeOpacity={0.88}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>Ver mis rutas ahora</Text>
              <MaterialIcons name="chevron-right" size={22} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Location picker modal ── */}
      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerTarget(null)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {pickerTarget === 'origin' ? 'Selecciona el origen' : 'Selecciona el destino'}
          </Text>
          <ScrollView>
            {SABANA_LOCATIONS.map((loc) => {
              const isSelected =
                pickerTarget === 'origin' ? loc.id === origin.id : loc.id === destination.id;
              return (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                  onPress={() => handleSelectLocation(loc)}
                  activeOpacity={0.85}
                >
                  <View style={styles.modalItemLeft}>
                    <MaterialIcons
                      name="place"
                      size={22}
                      color={isSelected ? '#1B3A6B' : '#747780'}
                    />
                    <View>
                      <Text style={[styles.modalItemLabel, isSelected && styles.modalItemLabelSelected]}>
                        {loc.label}
                      </Text>
                      <Text style={styles.modalItemSub}>{loc.sublabel}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={20} color="#1B3A6B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  scroll: { flex: 1 },
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
  fieldGroup: { gap: 4 },
  section: { gap: 8 },
  field: { gap: 4 },
  label: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: '#44474f',
  },

  // Location selector button
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c4c6d0',
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  locationSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationSelectorText: { gap: 1 },
  locationSelectorLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191c1e',
  },
  locationSelectorSub: {
    fontSize: 12,
    color: '#747780',
  },

  // Connector between origin and destination
  connector: {
    paddingLeft: 21,
    height: 12,
  },
  connectorLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#c4c6d0',
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
  transportLabelActive: { color: '#1B3A6B' },

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
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c4c6d0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: '#2D751A' },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // ── Summary card ──
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF3FF',
    borderWidth: 1,
    borderColor: '#9ec5ff',
    borderRadius: 12,
    padding: 14,
  },
  summaryText: { flex: 1 },
  summaryTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1B3A6B',
  },
  summarySub: {
    fontSize: 12,
    color: '#185FA5',
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  profilesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  profilesLinkText: {
    fontSize: 14,
    color: '#185FA5',
    fontWeight: '500',
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
  ctaButtonDisabled: { opacity: 0.6 },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },

  // ── Location picker modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#c4c6d0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#002452',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  modalItemSelected: { backgroundColor: '#EBF3FF' },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191c1e',
  },
  modalItemLabelSelected: { color: '#1B3A6B' },
  modalItemSub: {
    fontSize: 12,
    color: '#747780',
    marginTop: 2,
  },
});
