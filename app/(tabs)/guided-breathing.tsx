import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function GuidedBreathingScreen() {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(180);

  // Breathing loop (4 s in, 4 s out)
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [breathAnim]);

  // Phase label (matches breathing cycle)
  useEffect(() => {
    const t = setInterval(() => {
      setPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) return;
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Derived animation values — inner circle most dramatic, outer subtlest
  const scale1 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const opacity1 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0.95] });
  const scale2 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const opacity2 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.55] });
  const scale3 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const opacity3 = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.3] });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wellness Mode</Text>
        </View>
        <TouchableOpacity hitSlop={8} style={styles.iconBtn} onPress={() => router.push('/profile' as any)}>
          <MaterialIcons name="account-circle" size={26} color="#1e3a5f" />
        </TouchableOpacity>
      </View>

      {/* Main canvas */}
      <View style={styles.main}>
        {/* Decorative ambient blobs */}
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />

        {/* Center group: timer + circles + hint */}
        <View style={styles.centerGroup}>
          {/* Timer pill */}
          <View style={styles.timerPill}>
            <MaterialIcons name="timer" size={20} color="#002452" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>

          {/* Animated breathing circles */}
          <View style={styles.circlesContainer}>
            <Animated.View style={[
              styles.circle3,
              { transform: [{ scale: scale3 }], opacity: opacity3 },
            ]} />
            <Animated.View style={[
              styles.circle2,
              { transform: [{ scale: scale2 }], opacity: opacity2 },
            ]} />
            <Animated.View style={[
              styles.circle1,
              { transform: [{ scale: scale1 }], opacity: opacity1 },
            ]} />
            <View style={styles.centralContent}>
              <Text style={styles.phaseText}>
                {phase === 'inhale' ? 'Inhala...' : 'Exhala...'}
              </Text>
              <Text style={styles.phaseHint}>
                Sigue el ritmo del círculo suavemente
              </Text>
            </View>
          </View>

          {/* Hint text */}
          <Text style={styles.hint}>
            Aprovecha este tiempo detenido para oxigenar tu cuerpo y reducir el estrés del trayecto.
          </Text>
        </View>

        {/* Finalizar — always at bottom */}
        <TouchableOpacity
          style={styles.finishBtn}
          activeOpacity={0.88}
          onPress={() => router.back()}
        >
          <Text style={styles.finishBtnText}>Finalizar</Text>
          <MaterialIcons name="check-circle" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CIRCLE1 = 156;
const CIRCLE2 = 208;
const CIRCLE3 = 264;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EAF4FE' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 20, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a5f', letterSpacing: -0.3 },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 32,
    overflow: 'hidden',
  },

  // Decorative ambient circles (non-animated)
  blob: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(122,179,255,0.12)',
    pointerEvents: 'none',
  },
  blobTop: { top: -60, left: -40 },
  blobBottom: { bottom: -60, right: -40 },

  // Center group
  centerGroup: { alignItems: 'center', gap: 32 },

  // Timer pill
  timerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1, borderColor: '#c4c6d0',
  },
  timerText: { fontSize: 18, fontWeight: '700', color: '#002452', letterSpacing: -0.3 },

  // Breathing circles
  circlesContainer: {
    width: CIRCLE3,
    height: CIRCLE3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    width: CIRCLE1, height: CIRCLE1, borderRadius: CIRCLE1 / 2,
    backgroundColor: '#7ab3ff',
  },
  circle2: {
    position: 'absolute',
    width: CIRCLE2, height: CIRCLE2, borderRadius: CIRCLE2 / 2,
    backgroundColor: 'rgba(122,179,255,0.45)',
  },
  circle3: {
    position: 'absolute',
    width: CIRCLE3, height: CIRCLE3, borderRadius: CIRCLE3 / 2,
    backgroundColor: 'rgba(122,179,255,0.2)',
  },
  centralContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  phaseText: {
    fontSize: 26, fontWeight: '700', color: '#002452',
    letterSpacing: -0.5, marginBottom: 8, textAlign: 'center',
  },
  phaseHint: {
    fontSize: 13, lineHeight: 18, color: '#44474f',
    textAlign: 'center', maxWidth: 130,
  },

  // Hint paragraph
  hint: {
    fontSize: 14, lineHeight: 21,
    color: 'rgba(0,68,126,0.65)',
    textAlign: 'center', maxWidth: 300,
  },

  // Finish button
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#1960a6',
    borderRadius: 12, paddingVertical: 16,
    width: '100%',
    shadowColor: '#1960a6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  finishBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
