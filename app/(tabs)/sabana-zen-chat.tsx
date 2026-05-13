import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// ─── Types & data ─────────────────────────────────────────────────────────────

type Sender = 'ai' | 'user';

interface ChatMessage {
  id: string;
  from: Sender;
  text: string;
  time: string;
}

const QUICK_SUGGESTIONS = ['Afirmación del día', 'Tips de calma', '¿Cuánto falta?'];

const AI_RESPONSES = [
  'Gracias por compartir. ¿Quieres intentar una respiración rápida de 4-7-8? Te ayudará a llegar más tranquilo.',
  'Entiendo. Recuerda: tu ruta ya está optimizada. Usa este tiempo para reconectar contigo mismo.',
  'Aquí va tu afirmación del día: "Soy capaz de manejar cualquier situación con calma y claridad."',
  'El tráfico de hoy tiene un retraso de ±8 min. Todo está bajo control. Respira profundo.',
  'Excelente actitud. Cada minuto de calma en el trayecto impacta positivamente en tu día.',
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    from: 'ai',
    text: 'Hola Andrés, parece que el tráfico está pesado hoy. ¿Cómo te sientes para este trayecto?',
    time: '10:02 AM',
  },
  {
    id: '2',
    from: 'user',
    text: 'Un poco ansioso por llegar tarde.',
    time: '10:03 AM',
  },
  {
    id: '3',
    from: 'ai',
    text: 'Es comprensible, pero recuerda que ya configuraste tu ruta óptima. Tienes el control. ¿Quieres que hagamos una breve afirmación positiva o prefieres escuchar algo de música relajante?',
    time: '10:03 AM',
  },
];

const NAV_TABS = [
  { icon: 'chat', label: 'Chat', active: true, route: null },
  { icon: 'show-chart', label: 'Progreso', active: false, route: '/wellness-history' },
  { icon: 'spa', label: 'Meditar', active: false, route: '/relaxation-library' },
  { icon: 'person', label: 'Perfil', active: false, route: '/profile' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

let aiResponseIndex = 0;

function getTimeString() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function nextAiResponse() {
  const r = AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length];
  aiResponseIndex++;
  return r;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SabanaZenChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = getTimeString();
    const userMsg: ChatMessage = { id: String(Date.now()), from: 'user', text: trimmed, time };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        from: 'ai',
        text: nextAiResponse(),
        time: getTimeString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconBtn} hitSlop={8}>
            <MaterialIcons name="menu" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Sabana Zen</Text>
            <Text style={styles.headerSub}>TU COMPAÑERO DE CALMA</Text>
          </View>
        </View>
        <View style={styles.aiAvatar}>
          <MaterialIcons name="spa" size={22} color="#004883" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {messages.map(msg =>
            msg.from === 'ai' ? (
              <View key={msg.id} style={styles.aiRow}>
                <View style={styles.aiBubble}>
                  <Text style={styles.aiBubbleText}>{msg.text}</Text>
                </View>
                <Text style={styles.timestamp}>{msg.time}</Text>
              </View>
            ) : (
              <View key={msg.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{msg.text}</Text>
                </View>
                <Text style={[styles.timestamp, { alignSelf: 'flex-end', marginRight: 4 }]}>
                  {msg.time}
                </Text>
              </View>
            )
          )}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.aiRow}>
              <View style={[styles.aiBubble, styles.typingBubble]}>
                <Text style={styles.typingText}>Sabana Zen está escribiendo…</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          {/* Quick suggestions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {QUICK_SUGGESTIONS.map(s => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => sendMessage(s)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text input bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.inputIconBtn} hitSlop={8}>
              <MaterialIcons name="mic" size={22} color="#747780" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#9EA3AC"
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              multiline={false}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => sendMessage(inputText)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.navTab, tab.active && styles.navTabActive]}
            onPress={() => tab.route && router.push(tab.route as any)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={tab.active ? '#185FA5' : '#94a3b8'}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1, borderBottomColor: '#C5CDD8',
    minHeight: 64,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1B3A6B', letterSpacing: -0.3 },
  headerSub: {
    fontSize: 10, fontWeight: '700', color: '#64748B',
    letterSpacing: 1.5, textTransform: 'uppercase', marginTop: -2,
  },
  aiAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#d4e3ff',
    borderWidth: 1, borderColor: '#7ab3ff',
    alignItems: 'center', justifyContent: 'center',
  },

  // Chat
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 20, paddingBottom: 8 },

  aiRow: { alignItems: 'flex-start', maxWidth: '85%', gap: 4 },
  aiBubble: {
    backgroundColor: '#d4e3ff',
    borderRadius: 12, borderTopLeftRadius: 0,
    padding: 14,
    borderWidth: 1, borderColor: '#C5CDD8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  aiBubbleText: { fontSize: 14, lineHeight: 20, color: '#004883' },
  typingBubble: { paddingVertical: 10 },
  typingText: { fontSize: 13, color: '#747780', fontStyle: 'italic' },

  userRow: { alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '85%', gap: 4 },
  userBubble: {
    backgroundColor: '#fff',
    borderRadius: 12, borderTopRightRadius: 0,
    padding: 14,
    borderWidth: 1, borderColor: '#C5CDD8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  userBubbleText: { fontSize: 14, lineHeight: 20, color: '#191c1e' },

  timestamp: {
    fontSize: 11, fontWeight: '500', color: '#747780',
    letterSpacing: 0.3, marginLeft: 4,
  },

  // Input area
  inputArea: {
    backgroundColor: '#F8F9FB',
    borderTopWidth: 1, borderTopColor: '#C5CDD8',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    gap: 10,
  },
  suggestionsRow: { gap: 8, paddingBottom: 2 },
  suggestionChip: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  suggestionText: { fontSize: 12, fontWeight: '600', color: '#1960a6', letterSpacing: 0.2 },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#C5CDD8',
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  inputIconBtn: { padding: 6 },
  textInput: {
    flex: 1, fontSize: 14, lineHeight: 20, color: '#191c1e',
    paddingHorizontal: 4, paddingVertical: 6,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#185FA5',
    alignItems: 'center', justifyContent: 'center',
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', height: 64, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#C5CDD8', paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 8,
  },
  navTab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 8,
  },
  navTabActive: {},
  navLabel: {
    fontWeight: '500', fontSize: 11, color: '#94a3b8',
  },
  navLabelActive: { color: '#185FA5', fontWeight: '600' },
});
