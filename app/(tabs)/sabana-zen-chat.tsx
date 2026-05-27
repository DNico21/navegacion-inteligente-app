import { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import BottomNavBar from '@/components/BottomNavBar';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import { sendMessageToGemini, GeminiMessage } from '@/utils/geminiService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = 'ai' | 'user';

interface ChatMessage {
  id: string;
  from: Sender;
  text: string;
  time: string;
}

const QUICK_SUGGESTIONS = ['Afirmación del día', 'Tips de calma', '¿Cuánto falta?'];

const GREETING =
  'Hola, soy Sabana Zen, tu compañero de calma en el trayecto. ¿Cómo te sientes hoy para el viaje?';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeString() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SabanaZenChatScreen() {
  const { state } = useContext(AuthContext);
  const firstName = state.user?.firstname ?? 'viajero';

  const initialGreeting = GREETING.replace('Hola,', `Hola ${firstName},`);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', from: 'ai', text: initialGreeting, time: getTimeString() },
  ]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([
    { role: 'model', text: initialGreeting },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const time = getTimeString();
    const userMsg: ChatMessage = { id: String(Date.now()), from: 'user', text: trimmed, time };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiText = await sendMessageToGemini(geminiHistory, trimmed);

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        from: 'ai',
        text: aiText,
        time: getTimeString(),
      };

      setGeminiHistory(prev => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'model', text: aiText },
      ]);
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      Alert.alert(
        'Sin conexión',
        'No se pudo contactar a Sabana Zen. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <MaterialIcons name="spa" size={22} color="#004883" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Sabana Zen</Text>
            <Text style={styles.headerSub}>TU COMPAÑERO DE CALMA · IA</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          hitSlop={8}
          onPress={() =>
            Alert.alert(
              'Sabana Zen',
              'Powered by Google Gemini 1.5 Flash.\nTus conversaciones no se almacenan.',
            )
          }
        >
          <MaterialIcons name="info-outline" size={22} color="#64748B" />
        </TouchableOpacity>
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
            ),
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
                disabled={isTyping}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#9EA3AC"
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              multiline={false}
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[styles.sendBtn, isTyping && styles.sendBtnDisabled]}
              onPress={() => sendMessage(inputText)}
              activeOpacity={0.85}
              disabled={isTyping}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomNavBar active="wellness" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },

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
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  textInput: {
    flex: 1, fontSize: 14, lineHeight: 20, color: '#191c1e',
    paddingVertical: 6,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#185FA5',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#94a3b8' },
});
