import { useContext, useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WellnessData {
  totalZenMin: number;
  sessionCount: number;
  weeklyBars: { day: string; height: number; active: boolean }[];
  lastMood: string | null;
  streakDays: number;
  achieveBreathing: boolean;
  achieveStreak: boolean;
}

const DAY_LABELS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const MOOD_LABELS: Record<string, string> = {
  stressed: 'Estresado',
  tired: 'Cansado',
  neutral: 'Neutro',
  good: 'Bien',
  great: 'Excelente',
};

const MOOD_ICONS: Record<string, string> = {
  stressed: 'sentiment-very-dissatisfied',
  tired: 'sentiment-dissatisfied',
  neutral: 'sentiment-neutral',
  good: 'sentiment-satisfied',
  great: 'sentiment-very-satisfied',
};

const MOOD_COLORS: Record<string, string> = {
  stressed: '#DC2626',
  tired: '#D97706',
  neutral: '#6B7280',
  good: '#059669',
  great: '#2563EB',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sunday
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getInsightQuote(data: WellnessData): string {
  if (data.sessionCount === 0) {
    return 'Inicia tu primera sesión de respiración en Modo Bienestar para descubrir tus patrones aquí.';
  }
  if (data.lastMood === 'stressed' || data.lastMood === 'tired') {
    return `Registramos momentos difíciles. Con ${data.sessionCount} sesión${data.sessionCount !== 1 ? 'es' : ''} de respiración ya das pasos hacia la calma. ¡Sigue así!`;
  }
  if (data.sessionCount >= 10) {
    return `¡Increíble! Con ${data.sessionCount} sesiones de respiración eres un referente de bienestar en ruta.`;
  }
  return `Llevas ${data.sessionCount} sesión${data.sessionCount !== 1 ? 'es' : ''} de respiración. Cada una reduce el estrés acumulado en la ruta.`;
}

// ─── Data Fetch ───────────────────────────────────────────────────────────────

async function fetchWellnessData(): Promise<WellnessData> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return buildEmpty();
  }

  const monday = getMondayOfCurrentWeek();

  // Fetch all analytics events for this user
  const [eventsSnap, tripsSnap] = await Promise.all([
    getDocs(query(collection(db, 'analytics_events'), where('userId', '==', uid))),
    getDocs(query(collection(db, 'planned_trips'), where('userId', '==', uid))),
  ]);

  const allEvents = eventsSnap.docs.map(d => d.data());
  const allTrips = tripsSnap.docs.map(d => d.data());

  const breathingEvents = allEvents.filter(e => e.event === 'breathing_started');
  const moodEvents = allEvents.filter(e => e.event === 'mood_checkin');

  // Session count and zen minutes
  const sessionCount = breathingEvents.length;
  const totalZenMin = sessionCount * 3; // each guided breathing = 3 min

  // Weekly bar chart: breathing sessions per day this week
  const weeklyCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const ev of breathingEvents) {
    const ts = ev.timestamp?.toDate?.() ?? null;
    if (ts && ts >= monday) {
      const dow = ts.getDay(); // 0=Sun
      // Shift so index 0 = Mon
      const idx = dow === 0 ? 6 : dow - 1;
      weeklyCount[idx] = (weeklyCount[idx] ?? 0) + 1;
    }
  }
  const maxCount = Math.max(...Object.values(weeklyCount), 1);
  const todayDow = new Date().getDay();
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;
  // Mon(0)→L, Tue(1)→M, Wed(2)→M, Thu(3)→J, Fri(4)→V, Sat(5)→S, Sun(6)→D
  const dayShortLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weeklyBars = Array.from({ length: 7 }, (_, i) => ({
    day: dayShortLabels[i],
    height: Math.max(16, Math.round((weeklyCount[i] / maxCount) * 112)),
    active: i === todayIdx,
  }));

  // Last mood
  let lastMood: string | null = null;
  if (moodEvents.length > 0) {
    const sorted = [...moodEvents].sort((a, b) => {
      const ta = a.timestamp?.toDate?.()?.getTime() ?? 0;
      const tb = b.timestamp?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
    lastMood = sorted[0]?.params?.mood ?? null;
  }

  // Streak: distinct dates with planned trips
  const distinctDates = new Set(allTrips.map(t => t.date as string).filter(Boolean));
  const streakDays = distinctDates.size;

  return {
    totalZenMin,
    sessionCount,
    weeklyBars,
    lastMood,
    streakDays,
    achieveBreathing: sessionCount >= 5,
    achieveStreak: streakDays >= 7,
  };
}

function buildEmpty(): WellnessData {
  const dayShortLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return {
    totalZenMin: 0,
    sessionCount: 0,
    weeklyBars: dayShortLabels.map((day, i) => ({ day, height: 16, active: false })),
    lastMood: null,
    streakDays: 0,
    achieveBreathing: false,
    achieveStreak: false,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WellnessHistoryScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;

  const initials = user?.firstname && user?.lastname
    ? (user.firstname[0] + user.lastname[0]).toUpperCase()
    : (user?.fullName ?? 'U').slice(0, 2).toUpperCase();

  const [data, setData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellnessData()
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const d = data ?? buildEmpty();
  const insight = data ? getInsightQuote(data) : '';

  const ACHIEVEMENTS = [
    {
      icon: 'air',
      iconColor: d.achieveBreathing ? '#2D751A' : '#94A3B8',
      iconBg: d.achieveBreathing ? '#EBF5E9' : '#F1F5F9',
      title: 'Respiración Activa',
      subtitle: d.achieveBreathing ? `${d.sessionCount} sesiones` : 'Necesitas 5 sesiones',
      locked: !d.achieveBreathing,
    },
    {
      icon: 'event',
      iconColor: d.achieveStreak ? '#185FA5' : '#94A3B8',
      iconBg: d.achieveStreak ? '#F0F7FF' : '#F1F5F9',
      title: 'Rutero Consistente',
      subtitle: d.achieveStreak ? '7+ días activo' : `${d.streakDays}/7 días`,
      locked: !d.achieveStreak,
    },
    {
      icon: 'nightlight-round',
      iconColor: '#94A3B8',
      iconBg: '#F1F5F9',
      title: 'Guía Nocturno',
      subtitle: 'Próximamente',
      locked: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Historial de Bienestar</Text>
            <Text style={styles.headerSub}>Tu equilibrio en la ruta</Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={8} onPress={() => router.push('/alerts' as any)}>
          <MaterialIcons name="notifications" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#185FA5" />
          <Text style={styles.loadingText}>Cargando tu bienestar…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary bento */}
          <View style={{ gap: 14 }}>
            <View style={styles.zenCard}>
              <View>
                <Text style={styles.zenLabel}>Minutos Zen Totales</Text>
                <Text style={styles.zenValue}>
                  {d.totalZenMin > 0 ? `${d.totalZenMin} min` : 'Sin sesiones aún'}
                </Text>
              </View>
              <View style={styles.zenIconBox}>
                <MaterialIcons name="spa" size={26} color="#185FA5" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={[styles.smallCard, { flex: 1 }]}>
                <Text style={styles.smallLabel}>Sesiones</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
                  <Text style={styles.smallValue}>{d.sessionCount}</Text>
                  <Text style={styles.smallTag}>respiración</Text>
                </View>
              </View>
              <View style={[styles.smallCard, { flex: 1 }]}>
                <Text style={styles.smallLabel}>Días activo</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
                  <Text style={[styles.smallValue, { color: '#185FA5' }]}>{d.streakDays}</Text>
                  <Text style={styles.smallEst}>días</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Actividad Semanal</Text>
            <View style={styles.card}>
              <View style={styles.barChart}>
                {d.weeklyBars.map((bar, i) => (
                  <View key={`${bar.day}-${i}`} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: bar.height,
                          backgroundColor: bar.active ? '#185FA5' : bar.height > 16 ? '#EBF5E9' : '#F1F5F9',
                        },
                      ]}
                    />
                    <Text style={[styles.barDayLabel, bar.active && { color: '#185FA5', fontWeight: '700' }]}>
                      {bar.day}
                    </Text>
                  </View>
                ))}
              </View>
              {d.sessionCount === 0 && (
                <Text style={styles.chartEmpty}>
                  Inicia sesiones de respiración en Modo Bienestar para ver tu actividad semanal.
                </Text>
              )}
            </View>
          </View>

          {/* Mood tracker */}
          <View style={{ gap: 10 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Estado de Ánimo</Text>
              <Text style={styles.sectionTag}>Último registrado</Text>
            </View>
            <View style={[styles.card, { gap: 16 }]}>
              {d.lastMood ? (
                <View style={styles.moodRow}>
                  <MaterialIcons
                    name={MOOD_ICONS[d.lastMood] as any}
                    size={32}
                    color={MOOD_COLORS[d.lastMood]}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.moodPeriodLabel}>Último check-in</Text>
                    <Text style={[styles.moodText, { color: MOOD_COLORS[d.lastMood] }]}>
                      {MOOD_LABELS[d.lastMood]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moodCta}
                    onPress={() => router.push('/wellness-mode' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodCtaText}>Registrar ahora</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.moodEmpty}>
                  <MaterialIcons name="sentiment-neutral" size={28} color="#94A3B8" />
                  <Text style={styles.moodEmptyText}>
                    Sin datos de ánimo aún. Visita Modo Bienestar para registrar cómo te sientes en ruta.
                  </Text>
                  <TouchableOpacity
                    style={styles.moodCta}
                    onPress={() => router.push('/wellness-mode' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodCtaText}>Ir a Modo Bienestar</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.quoteCard}>
                <MaterialIcons name="lightbulb" size={22} color="#185FA5" style={{ flexShrink: 0 }} />
                <Text style={styles.quoteText}>"{insight}"</Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Logros</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14, paddingRight: 4 }}
            >
              {ACHIEVEMENTS.map(item => (
                <View
                  key={item.title}
                  style={[styles.achieveCard, item.locked && { opacity: 0.5 }]}
                >
                  <View style={[styles.achieveIconBox, { backgroundColor: item.iconBg }]}>
                    <MaterialIcons name={item.icon as any} size={22} color={item.iconColor} />
                  </View>
                  <Text style={styles.achieveTitle}>{item.title}</Text>
                  <Text style={[styles.achieveSub, !item.locked && { color: item.iconColor }]}>
                    {item.subtitle}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Calm space */}
          <TouchableOpacity
            style={styles.calmCard}
            activeOpacity={0.9}
            onPress={() => router.push('/wellness-mode' as any)}
          >
            <View style={styles.calmImageBox}>
              <MaterialIcons name="landscape" size={48} color="#B0B8C4" />
            </View>
            <View style={styles.calmOverlay} />
            <View style={styles.calmTextBox}>
              <Text style={styles.calmTitle}>Tu espacio de calma</Text>
              <Text style={styles.calmSub}>
                {d.sessionCount === 0
                  ? 'Toca para iniciar tu primera sesión'
                  : 'Continúa tu práctica de bienestar'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      <BottomNavBar active="wellness" />
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1B3A6B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#c4c6d0',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerTitle: { fontWeight: '700', fontSize: 16, color: '#1B3A6B' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 24 },

  loadingWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },

  // Zen summary
  zenCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 16,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  zenLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 0.2 },
  zenValue: { fontSize: 26, fontWeight: '700', color: '#185FA5', letterSpacing: -0.5, marginTop: 2 },
  zenIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center',
  },

  // Small metric cards
  smallCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 14,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  smallLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 0.2 },
  smallValue: { fontSize: 22, fontWeight: '600', color: '#002452', letterSpacing: -0.3 },
  smallTag: { fontSize: 11, fontWeight: '500', color: '#2D751A', marginBottom: 2 },
  smallEst: { fontSize: 11, fontWeight: '500', color: '#64748B', marginBottom: 2 },

  // Section headings
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#002452', lineHeight: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTag: { fontSize: 12, fontWeight: '600', color: '#185FA5' },

  // Generic white card
  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 16,
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },

  // Bar chart
  barChart: {
    height: 128, flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', paddingHorizontal: 8,
  },
  barCol: { alignItems: 'center', gap: 6 },
  bar: { width: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barDayLabel: { fontSize: 11, fontWeight: '500', color: '#64748B', letterSpacing: 0.5 },
  chartEmpty: {
    fontSize: 12, color: '#94A3B8', textAlign: 'center',
    marginTop: 8, lineHeight: 18,
  },

  // Mood tracker
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moodEmpty: { alignItems: 'center', gap: 10 },
  moodPeriodLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', letterSpacing: 0.2 },
  moodText: { fontSize: 16, fontWeight: '700' },
  moodEmptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19 },
  moodCta: {
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#93C5FD',
  },
  moodCtaText: { fontSize: 12, fontWeight: '700', color: '#185FA5' },
  quoteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4, borderLeftColor: '#185FA5',
    borderRadius: 8, padding: 14,
  },
  quoteText: { flex: 1, fontSize: 13, lineHeight: 20, color: '#1B3A6B', fontStyle: 'italic' },

  // Achievements
  achieveCard: {
    width: 140, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  achieveIconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  achieveTitle: { fontSize: 12, fontWeight: '600', color: '#002452', textAlign: 'center', lineHeight: 16 },
  achieveSub: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center' },

  // Calm card
  calmCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#1b3a6b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 1,
  },
  calmImageBox: { height: 160, backgroundColor: '#d8dadc', alignItems: 'center', justifyContent: 'center' },
  calmOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
    backgroundColor: 'rgba(27,58,107,0.45)',
  },
  calmTextBox: { position: 'absolute', bottom: 16, left: 16 },
  calmTitle: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 26 },
  calmSub: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
});
