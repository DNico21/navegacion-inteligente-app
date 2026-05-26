import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "@/components/BottomNavBar";

const WEEKLY_BARS = [
  { day: "L", height: 48, color: "#EBF5E9" },
  { day: "M", height: 80, color: "#EBF5E9" },
  { day: "M", height: 112, color: "#185FA5" },
  { day: "J", height: 64, color: "#EBF5E9" },
  { day: "V", height: 96, color: "#EBF5E9" },
  { day: "S", height: 32, color: "#F8F1E8" },
  { day: "D", height: 24, color: "#F8F1E8" },
];

const ACHIEVEMENTS = [
  {
    icon: "air",
    iconColor: "#2D751A",
    iconBg: "#EBF5E9",
    title: "Breathing Master",
    subtitle: "Nivel 4",
    locked: false,
  },
  {
    icon: "event",
    iconColor: "#185FA5",
    iconBg: "#F0F7FF",
    title: "7-day streak",
    subtitle: "Consistente",
    locked: false,
  },
  {
    icon: "lock",
    iconColor: "#B03A39",
    iconBg: "#FCECEC",
    title: "Guía Nocturno",
    subtitle: "Bloqueado",
    locked: true,
  },
];


export default function WellnessHistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/profile" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarText}>U</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Historial de Bienestar</Text>
            <Text style={styles.headerSub}>Tu equilibrio en la ruta</Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={8}>
          <MaterialIcons name="notifications" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary bento */}
        <View style={{ gap: 14 }}>
          <View style={styles.zenCard}>
            <View>
              <Text style={styles.zenLabel}>Total Zen Minutes</Text>
              <Text style={styles.zenValue}>45 min</Text>
            </View>
            <View style={styles.zenIconBox}>
              <MaterialIcons name="spa" size={26} color="#185FA5" />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={[styles.smallCard, { flex: 1 }]}>
              <Text style={styles.smallLabel}>Sessions</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <Text style={styles.smallValue}>12</Text>
                <Text style={styles.smallTag}>Breathing</Text>
              </View>
            </View>
            <View style={[styles.smallCard, { flex: 1 }]}>
              <Text style={styles.smallLabel}>Stress Red.</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <Text style={[styles.smallValue, { color: "#B03A39" }]}>
                  -22%
                </Text>
                <Text style={styles.smallEst}>Est.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Actividad Semanal</Text>
          <View style={styles.card}>
            <View style={styles.barChart}>
              {WEEKLY_BARS.map((bar, i) => (
                <View key={`${bar.day}-${i}`} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      { height: bar.height, backgroundColor: bar.color },
                    ]}
                  />
                  <Text style={styles.barDayLabel}>{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Mood Tracker */}
        <View style={{ gap: 10 }}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Estado de Ánimo</Text>
            <Text style={styles.sectionTag}>Pre vs Post</Text>
          </View>
          <View style={[styles.card, { gap: 16 }]}>
            <View style={styles.moodRow}>
              <View style={{ gap: 4 }}>
                <Text style={styles.moodPeriodLabel}>Antes del viaje</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <MaterialIcons
                    name="sentiment-dissatisfied"
                    size={24}
                    color="#B03A39"
                  />
                  <Text style={styles.moodText}>Estresado</Text>
                </View>
              </View>
              <MaterialIcons name="trending-flat" size={22} color="#747780" />
              <View style={{ gap: 4, alignItems: "flex-end" }}>
                <Text style={styles.moodPeriodLabel}>Después de Lo-Fi</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={styles.moodText}>Calma</Text>
                  <MaterialIcons
                    name="sentiment-satisfied"
                    size={24}
                    color="#2D751A"
                  />
                </View>
              </View>
            </View>

            <View style={styles.quoteCard}>
              <MaterialIcons
                name="lightbulb"
                size={22}
                color="#185FA5"
                style={{ flexShrink: 0 }}
              />
              <Text style={styles.quoteText}>
                "Te sientes más relajado los lunes después de la sesión Lo-Fi"
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Logros Alcanzados</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingRight: 4 }}
          >
            {ACHIEVEMENTS.map((item) => (
              <View
                key={item.title}
                style={[styles.achieveCard, item.locked && { opacity: 0.5 }]}
              >
                <View
                  style={[
                    styles.achieveIconBox,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={22}
                    color={item.iconColor}
                  />
                </View>
                <Text style={styles.achieveTitle}>{item.title}</Text>
                <Text style={styles.achieveSub}>{item.subtitle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Calm space */}
        <View style={styles.calmCard}>
          <View style={styles.calmImageBox}>
            <MaterialIcons name="landscape" size={48} color="#B0B8C4" />
          </View>
          <View style={styles.calmOverlay} />
          <View style={styles.calmTextBox}>
            <Text style={styles.calmTitle}>Tu espacio de calma</Text>
            <Text style={styles.calmSub}>
              Sugerencia: Meditación de 5 min hoy
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="wellness" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F6F8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: "#F4F6F8",
    borderBottomWidth: 1,
    borderBottomColor: "#C5CDD8",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B3A6B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c4c6d0",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  headerTitle: { fontWeight: "700", fontSize: 16, color: "#1B3A6B" },
  headerSub: { fontSize: 11, color: "#64748B", fontWeight: "500" },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 24 },

  // Zen summary card
  zenCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C5CDD8",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#1b3a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  zenLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.2,
  },
  zenValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#185FA5",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  zenIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // Small metric cards
  smallCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C5CDD8",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#1b3a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.2,
  },
  smallValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "#002452",
    letterSpacing: -0.3,
  },
  smallTag: {
    fontSize: 11,
    fontWeight: "500",
    color: "#2D751A",
    marginBottom: 2,
  },
  smallEst: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
  },

  // Section headings
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#002452",
    lineHeight: 24,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTag: { fontSize: 12, fontWeight: "600", color: "#185FA5" },

  // Generic white card
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C5CDD8",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#1b3a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },

  // Bar chart
  barChart: {
    height: 128,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  barCol: { alignItems: "center", gap: 6 },
  bar: { width: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barDayLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    letterSpacing: 0.5,
  },

  // Mood tracker
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eceef0",
    paddingBottom: 16,
  },
  moodPeriodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.2,
  },
  moodText: { fontSize: 14, fontWeight: "500", color: "#191c1e" },
  quoteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 4,
    borderLeftColor: "#185FA5",
    borderRadius: 8,
    padding: 14,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#1B3A6B",
    fontStyle: "italic",
  },

  // Achievements
  achieveCard: {
    width: 140,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C5CDD8",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#1b3a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  achieveIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achieveTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#002452",
    textAlign: "center",
    lineHeight: 16,
  },
  achieveSub: { fontSize: 10, color: "#64748B", marginTop: 2 },

  // Calm card
  calmCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C5CDD8",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#1b3a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  calmImageBox: {
    height: 160,
    backgroundColor: "#d8dadc",
    alignItems: "center",
    justifyContent: "center",
  },
  calmOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "rgba(27,58,107,0.45)",
  },
  calmTextBox: { position: "absolute", bottom: 16, left: 16 },
  calmTitle: { fontSize: 18, fontWeight: "700", color: "#fff", lineHeight: 26 },
  calmSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },

});
