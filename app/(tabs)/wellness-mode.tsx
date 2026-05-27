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
import BottomNavBar from '@/components/BottomNavBar';
import { RouteContext } from '@/context/RouteContext/RouteContext';
import { logEvent } from '@/utils/analyticsService';

const DAILY_TIPS = [
  'Respira profundo 3 veces antes de arrancar. Tu sistema nervioso te lo agradecerá.',
  'La música instrumental puede reducir el estrés en hasta 65 %. Pruébalo hoy.',
  'En cada semáforo: relaja conscientemente los hombros y la mandíbula.',
  'Una sonrisa genuina libera endorfinas. ¡Sonríe mientras manejas!',
  'Hidratarte bien mejora la concentración y reduce la irritabilidad en el tráfico.',
  'Llegar 5 min temprano cambia completamente tu estado de ánimo al llegar.',
  'El tráfico es temporal. Tu bienestar, permanente. Elige la calma hoy.',
];

const MOODS = [
  { emoji: '😰', label: 'Estresado', value: 'stressed', color: '#DC2626' },
  { emoji: '😕', label: 'Cansado',   value: 'tired',    color: '#D97706' },
  { emoji: '😐', label: 'Neutro',    value: 'neutral',  color: '#6B7280' },
  { emoji: '🙂', label: 'Bien',      value: 'good',     color: '#059669' },
  { emoji: '😄', label: 'Excelente', value: 'great',    color: '#2563EB' },
];

const BREATHING_TECHNIQUES = [
  {
    name: 'Respiración 4-7-8',
    desc: 'Inhala 4s · Sostén 7s · Exhala 8s',
    tag: 'Anti-ansiedad',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
    icon: 'self-improvement',
  },
  {
    name: 'Respiración en caja',
    desc: '4s por cada fase — inhala, sostén, exhala, sostén',
    tag: 'Enfoque',
    iconBg: '#DBEAFE',
    iconColor: '#1E40AF',
    icon: 'crop-square',
  },
  {
    name: 'Respiración diafragmática',
    desc: 'Sesión guiada de 3 min con animación',
    tag: 'Calma profunda',
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
    icon: 'spa',
  },
] as const;

export default function WellnessModeScreen() {
  const { selectedRoute } = useContext(RouteContext);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const todayTip = DAILY_TIPS[new Date().getDay()];

  const extraMin = selectedRoute
    ? Math.max(0, Math.round((selectedRoute.durationInTrafficSeconds - selectedRoute.durationSeconds) / 60))
    : 0;

  const hasRoute = !!selectedRoute;
  const severity = extraMin <= 5 ? 'low' : extraMin <= 15 ? 'medium' : 'high';
  const severityColor = severity === 'low' ? '#059669' : severity === 'medium' ? '#D97706' : '#DC2626';
  const progressRatio = Math.min(extraMin / 30, 1);

  function handleMoodSelect(value: string) {
    setSelectedMood(value);
    logEvent('mood_checkin', { mood: value, extraMin });
  }

  function handleBreathingPress(name: string) {
    logEvent('breathing_started', { technique: name });
    router.push('/guided-breathing' as any);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modo Bienestar</Text>
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
            {hasRoute
              ? `Ruta activa: ${selectedRoute!.summary}`
              : 'Planifica una ruta para ver tu impacto en tiempo real'}
          </Text>
        </View>

        {/* Traffic impact card */}
        <View style={styles.impactCard}>
          <View style={styles.decorCircle} />
          <View style={styles.impactContent}>
            <View style={styles.impactTimeRow}>
              <Text style={[styles.impactNum, { color: hasRoute ? severityColor : '#94A3B8' }]}>
                {hasRoute ? `+${extraMin}` : '—'}
              </Text>
              {hasRoute && <Text style={[styles.impactUnit, { color: severityColor }]}>min</Text>}
            </View>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={styles.impactLabel}>Tiempo extra estimado en tráfico</Text>
              <Text style={styles.impactBody}>
                {extraMin === 0 && hasRoute
                  ? '¡Tu ruta está fluida! Buen momento para salir.'
                  : hasRoute
                    ? 'Sabemos que el tráfico puede ser frustrante. Aprovecha este tiempo para reconectar contigo mismo.'
                    : 'Planifica tu ruta en el home para ver el impacto del tráfico aquí.'}
              </Text>
            </View>
            {hasRoute && (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressRatio * 100}%`, backgroundColor: severityColor }]} />
                </View>
                <Text style={[styles.updateLabel, { color: severityColor }]}>
                  {severity === 'low' ? 'TRÁFICO FLUIDO' : severity === 'medium' ? 'CONGESTIÓN MODERADA' : 'CONGESTIÓN ALTA'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Mood check-in */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo te sientes ahora?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.moodBtn,
                  selectedMood === m.value && { borderColor: m.color, backgroundColor: m.color + '12' },
                ]}
                onPress={() => handleMoodSelect(m.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === m.value && { color: m.color, fontWeight: '700' }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedMood && (
            <Text style={styles.moodFeedback}>
              Gracias por registrar tu estado. Recuerda: cada momento es una oportunidad de calma. 🌿
            </Text>
          )}
        </View>

        {/* Daily tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <MaterialIcons name="tips-and-updates" size={20} color="#92400E" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.tipHeading}>Consejo del día</Text>
            <Text style={styles.tipText}>{todayTip}</Text>
          </View>
        </View>

        {/* Breathing techniques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnicas de respiración</Text>
          <View style={{ gap: 10 }}>
            {BREATHING_TECHNIQUES.map(t => (
              <TouchableOpacity
                key={t.name}
                style={styles.breathingCard}
                activeOpacity={0.85}
                onPress={() => handleBreathingPress(t.name)}
              >
                <View style={[styles.breathingIconBox, { backgroundColor: t.iconBg }]}>
                  <MaterialIcons name={t.icon as any} size={22} color={t.iconColor} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.optionTitle}>{t.name}</Text>
                    <View style={[styles.tagChip, { backgroundColor: t.iconBg }]}>
                      <Text style={[styles.tagText, { color: t.iconColor }]}>{t.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.optionSub}>{t.desc}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos de bienestar</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.smallCard, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => router.push('/relaxation-library' as any)}
            >
              <View style={[styles.smallIconBox, { backgroundColor: '#D4E3FF' }]}>
                <MaterialIcons name="playlist-play" size={22} color="#001C39" />
              </View>
              <Text style={styles.optionTitle}>Playlists relajantes</Text>
              <Text style={styles.optionSub}>Curadas para conducir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallCard, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => router.push('/relaxation-library' as any)}
            >
              <View style={[styles.smallIconBox, { backgroundColor: '#D7E2FF' }]}>
                <MaterialIcons name="podcasts" size={22} color="#001A40" />
              </View>
              <Text style={styles.optionTitle}>Podcast de 10 min</Text>
              <Text style={styles.optionSub}>Dosis de inspiración</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sabana Zen Chat */}
        <TouchableOpacity
          style={styles.zenCard}
          activeOpacity={0.85}
          onPress={() => {
            logEvent('zen_chat_opened', {});
            router.push('/sabana-zen-chat' as any);
          }}
        >
          <View style={[styles.smallIconBox, { backgroundColor: '#D4E3FF' }]}>
            <MaterialIcons name="chat" size={22} color="#001C39" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.optionTitle}>Chat Sabana Zen</Text>
            <Text style={styles.optionSub}>Tu compañero de calma con IA · disponible 24/7</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#747780" />
        </TouchableOpacity>

        {/* Wellness reminder */}
        <View style={styles.reminderBox}>
          <MaterialIcons name="favorite" size={18} color="#BE185D" />
          <Text style={styles.reminderText}>
            Tu bienestar importa tanto como llegar a tiempo. La Sabana Zen cuida de ti en cada kilómetro.
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar active="wellness" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a5f', letterSpacing: -0.3 },

  scroll: { flex: 1, backgroundColor: '#EBF4FC' },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 24 },

  hero: { alignItems: 'center', gap: 6 },
  heroTitle: {
    fontSize: 22, fontWeight: '700', color: '#002452',
    letterSpacing: -0.5, lineHeight: 30, textAlign: 'center',
  },
  heroSub: {
    fontSize: 14, lineHeight: 20, color: '#475569', textAlign: 'center',
  },

  // Traffic impact card
  impactCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C4C6D0',
    borderRadius: 16, padding: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  decorCircle: {
    position: 'absolute', top: -48, right: -48,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(122,179,255,0.12)',
  },
  impactContent: { alignItems: 'center', gap: 12 },
  impactTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  impactNum: { fontSize: 52, fontWeight: '800', lineHeight: 56, letterSpacing: -1 },
  impactUnit: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  impactLabel: { fontSize: 15, fontWeight: '600', color: '#002452', lineHeight: 22 },
  impactBody: { fontSize: 13, lineHeight: 19, color: '#475569', textAlign: 'center', maxWidth: 280 },
  progressTrack: {
    width: '100%', height: 5,
    backgroundColor: '#F1F5F9', borderRadius: 9999, overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 9999 },
  updateLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Section
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },

  // Mood check-in
  moodRow: { flexDirection: 'row', gap: 8 },
  moodBtn: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, fontWeight: '500', color: '#64748B', textAlign: 'center' },
  moodFeedback: {
    fontSize: 12, color: '#059669', fontWeight: '500',
    textAlign: 'center', paddingHorizontal: 8, lineHeight: 18,
  },

  // Daily tip
  tipCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1, borderColor: '#FCD34D',
    borderRadius: 14, padding: 14,
  },
  tipIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
  },
  tipHeading: { fontSize: 12, fontWeight: '700', color: '#92400E', letterSpacing: 0.5 },
  tipText: { fontSize: 13, lineHeight: 19, color: '#78350F' },

  // Breathing techniques
  breathingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 14, padding: 14,
  },
  breathingIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tagChip: {
    borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2,
  },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Small cards
  smallCard: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 14, padding: 14, gap: 8,
    alignItems: 'flex-start',
  },
  smallIconBox: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  optionTitle: { fontSize: 13, fontWeight: '600', color: '#002452', lineHeight: 19 },
  optionSub: { fontSize: 11, fontWeight: '500', color: '#64748B', lineHeight: 15 },

  // Zen chat
  zenCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#93C5FD',
    borderRadius: 14, padding: 14,
  },

  // Reminder
  reminderBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: 1, borderColor: '#FECDD3',
    borderRadius: 14, padding: 14,
  },
  reminderText: { flex: 1, fontSize: 12, color: '#9F1239', lineHeight: 18, fontStyle: 'italic' },
});
