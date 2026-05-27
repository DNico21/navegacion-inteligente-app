import { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlanningContext, AddTripParams } from '@/context/PlanningContext/PlanningContext';
import { PlannedTrip } from '@/context/PlanningContext/PlanningReducer';
import { SABANA_LOCATIONS } from '@/constants/locations';
import BottomNavBar from '@/components/BottomNavBar';
import { logEvent } from '@/utils/analyticsService';

type Transport = 'car' | 'bus' | 'tm';

const TRANSPORT_ICONS: Record<Transport, string> = {
  car: 'directions-car',
  bus: 'directions-bus',
  tm: 'train',
};

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function todayLabel(): string {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ─── Add-trip form ────────────────────────────────────────────────────────────

interface AddFormProps {
  onSave: (params: AddTripParams) => Promise<void>;
  onCancel: () => void;
}

function AddTripForm({ onSave, onCancel }: AddFormProps) {
  const [originIdx, setOriginIdx] = useState(1); // Chía Centro
  const [destIdx, setDestIdx] = useState(0);     // Universidad de La Sabana
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('30');
  const [transport, setTransport] = useState<Transport>('car');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Hora inválida', 'Ingresa una hora válida (HH:MM en formato 24 h).');
      return;
    }
    if (SABANA_LOCATIONS[originIdx].id === SABANA_LOCATIONS[destIdx].id) {
      Alert.alert('Mismo origen y destino', 'Selecciona lugares distintos.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        originId: SABANA_LOCATIONS[originIdx].id,
        destinationId: SABANA_LOCATIONS[destIdx].id,
        arrivalTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        transport,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Nuevo viaje</Text>

      {/* Origin */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Desde</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {SABANA_LOCATIONS.map((loc, i) => (
            <TouchableOpacity
              key={loc.id}
              style={[styles.chip, originIdx === i && styles.chipActive]}
              onPress={() => setOriginIdx(i)}
            >
              <Text style={[styles.chipText, originIdx === i && styles.chipTextActive]}>
                {loc.label.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Destination */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Hasta</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {SABANA_LOCATIONS.map((loc, i) => (
            <TouchableOpacity
              key={loc.id}
              style={[styles.chip, destIdx === i && styles.chipActive]}
              onPress={() => setDestIdx(i)}
            >
              <Text style={[styles.chipText, destIdx === i && styles.chipTextActive]}>
                {loc.label.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Arrival time */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Hora de llegada (formato 24 h)</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            value={hour}
            onChangeText={setHour}
            keyboardType="numeric"
            maxLength={2}
            placeholder="07"
            placeholderTextColor="#9EA3AC"
          />
          <Text style={styles.timeSep}>:</Text>
          <TextInput
            style={styles.timeInput}
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
            maxLength={2}
            placeholder="30"
            placeholderTextColor="#9EA3AC"
          />
        </View>
      </View>

      {/* Transport */}
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Transporte</Text>
        <View style={styles.transportRow}>
          {(['car', 'bus', 'tm'] as Transport[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.transportBtn, transport === t && styles.transportBtnActive]}
              onPress={() => setTransport(t)}
            >
              <MaterialIcons
                name={TRANSPORT_ICONS[t] as any}
                size={22}
                color={transport === t ? '#1B3A6B' : '#747780'}
              />
              <Text style={[styles.transportBtnText, transport === t && styles.transportBtnTextActive]}>
                {t === 'car' ? 'Carro' : t === 'bus' ? 'Bus' : 'TM'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {saving ? (
        <View style={styles.savingRow}>
          <ActivityIndicator color="#185FA5" />
          <Text style={styles.savingText}>Calculando incertidumbre y programando notificación…</Text>
        </View>
      ) : (
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Calcular y guardar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Trip card ────────────────────────────────────────────────────────────────

interface TripCardProps {
  trip: PlannedTrip;
  onDelete: () => void;
}

function TripCard({ trip, onDelete }: TripCardProps) {
  const marginColor =
    trip.marginMinutes < 10 ? '#2D751A' : trip.marginMinutes < 20 ? '#8F5A12' : '#B03A39';
  const marginEmoji =
    trip.marginMinutes < 10 ? '🟢' : trip.marginMinutes < 20 ? '🟡' : '🔴';

  return (
    <View style={styles.tripCard}>
      <View style={styles.tripCardTop}>
        <View style={styles.tripCardLeft}>
          <Text style={styles.tripArrival}>
            Llegar a las {formatTime12h(trip.arrivalTime)}
          </Text>
          <Text style={styles.tripRoute}>
            {trip.originLabel} → {trip.destinationLabel}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={20} color="#B03A39" />
        </TouchableOpacity>
      </View>

      <View style={styles.tripStats}>
        <View style={styles.tripStat}>
          <Text style={styles.tripStatLabel}>SALIR A</Text>
          <Text style={styles.tripStatValue}>{formatTime12h(trip.departureSuggested)}</Text>
        </View>
        <View style={styles.tripStatDivider} />
        <View style={styles.tripStat}>
          <Text style={styles.tripStatLabel}>TIEMPO</Text>
          <Text style={styles.tripStatValue}>{trip.estimatedMinutes} min</Text>
        </View>
        <View style={styles.tripStatDivider} />
        <View style={styles.tripStat}>
          <Text style={styles.tripStatLabel}>MARGEN</Text>
          <Text style={[styles.tripStatValue, { color: marginColor }]}>
            ±{trip.marginMinutes} min {marginEmoji}
          </Text>
        </View>
      </View>

      {trip.notificationId && (
        <View style={styles.notifBadge}>
          <MaterialIcons name="notifications-active" size={13} color="#185FA5" />
          <Text style={styles.notifBadgeText}>
            Notificación a las{' '}
            {formatTime12h(
              (() => {
                const [h, m] = trip.departureSuggested.split(':').map(Number);
                const total = h * 60 + m - 30;
                const nh = Math.floor(Math.max(0, total) / 60);
                const nm = Math.max(0, total) % 60;
                return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
              })(),
            )}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlanDayScreen() {
  const { state, addTrip, removeTrip } = useContext(PlanningContext);
  const { trips, loading } = state;
  const [showForm, setShowForm] = useState(false);

  async function handleSave(params: AddTripParams) {
    await addTrip(params);
    logEvent('trip_planned', { originId: params.originId, destinationId: params.destinationId });
    setShowForm(false);
  }

  function handleDelete(tripId: string) {
    Alert.alert(
      'Eliminar viaje',
      '¿Quieres eliminar este viaje planificado? Se cancelará la notificación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeTrip(tripId),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Mi día</Text>
            <Text style={styles.headerSub}>{todayLabel()}</Text>
          </View>
        </View>
        {!showForm && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm(true)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="info-outline" size={18} color="#185FA5" />
          <Text style={styles.infoText}>
            La app calcula cuándo salir con margen de incertidumbre real del tráfico y te avisa 30 min antes.
          </Text>
        </View>

        {/* Add form */}
        {showForm && (
          <AddTripForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Trip list */}
        {loading ? (
          <ActivityIndicator color="#185FA5" style={{ marginTop: 32 }} />
        ) : trips.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-note" size={56} color="#C5CDD8" />
            <Text style={styles.emptyTitle}>Sin viajes planificados</Text>
            <Text style={styles.emptySub}>
              Toca el botón + para agregar tu primer viaje del día y recibir alertas de salida.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowForm(true)}
              activeOpacity={0.88}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Agregar viaje</Text>
            </TouchableOpacity>
          </View>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={() => handleDelete(trip.id)} />
          ))
        )}
      </ScrollView>

      <BottomNavBar active="plan-day" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },
  headerSub: { fontSize: 12, color: '#747780', marginTop: 1 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#185FA5', alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 24 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#E6F1FB', borderLeftWidth: 3, borderLeftColor: '#185FA5',
    borderRadius: 8, padding: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1B3A6B', lineHeight: 18 },

  // ── Form ──
  formCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#C5CDD8', padding: 16, gap: 14,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },
  formField: { gap: 6 },
  formLabel: { fontSize: 11, fontWeight: '600', color: '#747780', letterSpacing: 0.8, textTransform: 'uppercase' },

  chipRow: { flexGrow: 0 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#F4F6F8', borderRadius: 9999,
    borderWidth: 1, borderColor: '#C5CDD8', marginRight: 8,
  },
  chipActive: { backgroundColor: '#E6F1FB', borderColor: '#185FA5' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#44474f' },
  chipTextActive: { color: '#185FA5', fontWeight: '700' },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: {
    width: 64, height: 44, backgroundColor: '#F4F6F8',
    borderWidth: 1, borderColor: '#C5CDD8', borderRadius: 8,
    textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#191c1e',
  },
  timeSep: { fontSize: 22, fontWeight: '700', color: '#1B3A6B' },

  transportRow: { flexDirection: 'row', gap: 8 },
  transportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, backgroundColor: '#F4F6F8',
    borderRadius: 10, borderWidth: 1, borderColor: '#C5CDD8',
  },
  transportBtnActive: { backgroundColor: '#E6F1FB', borderColor: '#1B3A6B', borderWidth: 2 },
  transportBtnText: { fontSize: 12, fontWeight: '600', color: '#747780' },
  transportBtnTextActive: { color: '#1B3A6B' },

  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  savingText: { fontSize: 12, color: '#747780', flex: 1 },

  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#C5CDD8',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#44474f' },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 10, backgroundColor: '#185FA5',
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // ── Trip card ──
  tripCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#C5CDD8',
    overflow: 'hidden',
  },
  tripCardTop: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: 14, gap: 8,
  },
  tripCardLeft: { flex: 1, gap: 3 },
  tripArrival: { fontSize: 16, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.2 },
  tripRoute: { fontSize: 12, color: '#747780' },
  deleteBtn: { padding: 4 },

  tripStats: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F2F5',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  tripStat: { flex: 1, alignItems: 'center', gap: 2 },
  tripStatLabel: { fontSize: 9, fontWeight: '700', color: '#9EA3AC', letterSpacing: 1, textTransform: 'uppercase' },
  tripStatValue: { fontSize: 15, fontWeight: '700', color: '#1B3A6B' },
  tripStatDivider: { width: 1, height: 32, backgroundColor: '#E8EAED', marginHorizontal: 4 },

  notifBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#E0EBFF',
  },
  notifBadgeText: { fontSize: 11, color: '#185FA5', fontWeight: '500' },

  // ── Empty state ──
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A6B' },
  emptySub: { fontSize: 13, color: '#747780', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#185FA5', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

});
