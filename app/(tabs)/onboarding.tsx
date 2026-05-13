import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const FEATURES = [
  'Análisis predictivo de peajes y semáforos',
  'Estado de vía Chía-Cajicá en tiempo real',
  'Alertas de zonas escolares y carga',
];

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.iconBox}>
            {/* Route visualization: curved line + origin/destination dots */}
            <View style={styles.routeContainer}>
              {/* Diagonal line approximating the Bézier curve */}
              <View style={styles.routeLine} />
              {/* Origin – green */}
              <View style={[styles.routeDot, styles.dotOrigin]} />
              {/* Destination – red */}
              <View style={[styles.routeDot, styles.dotDestination]} />
            </View>
          </View>
        </View>

        {/* ── Branding ── */}
        <View style={styles.branding}>
          <Text style={styles.brandTitle}>Navegación Inteligente</Text>
          <Text style={styles.brandSubtitle}>Sabana Centro</Text>
        </View>

        {/* ── Content canvas ── */}
        <View style={styles.canvas}>
          {/* Card 1 – El problema real */}
          <View style={styles.problemCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="warning" size={22} color="#ba1a1a" />
              <Text style={styles.cardTitle}>El problema real</Text>
            </View>
            <Text style={styles.cardBody}>
              Las aplicaciones tradicionales prometen{' '}
              <Text style={styles.bold}>45 min</Text> de trayecto, pero la
              realidad de la Sabana es que terminas atrapado en congestión
              imprevista durante más de una hora.
            </Text>
          </View>

          {/* Card 2 – Nuestra diferencia */}
          <View style={styles.differenceCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={22} color="#1960a6" />
              <Text style={[styles.cardTitle, styles.secondaryText]}>
                Nuestra diferencia
              </Text>
            </View>
            <Text style={styles.cardBody}>
              Calculamos el trayecto basándonos en un{' '}
              <Text style={styles.bold}>± margen real de incertidumbre</Text>.
              No te damos una hora fija, te damos la ventana de tiempo
              garantizada para llegar.
            </Text>

            <View style={styles.featureList}>
              {FEATURES.map(item => (
                <View key={item} style={styles.featureRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.ctaText}>Comenzar — setup en 3 minutos</Text>
            <MaterialIcons name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>Chía · Cajicá · Bogotá</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1b3a6b',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Hero ──
  hero: {
    backgroundColor: '#1b3a6b',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(122,179,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Route visualization (48×48 canvas)
  routeContainer: {
    width: 48,
    height: 48,
  },
  routeLine: {
    position: 'absolute',
    width: 3,
    height: 40,
    borderRadius: 2,
    backgroundColor: '#89a5dd',
    left: 22,
    top: 4,
    transform: [{ rotate: '45deg' }],
  },
  routeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOrigin: {
    backgroundColor: '#5bba40',
    bottom: 6,
    left: 6,
  },
  dotDestination: {
    backgroundColor: '#ba1a1a',
    top: 6,
    right: 6,
  },

  // ── Branding ──
  branding: {
    backgroundColor: '#1b3a6b',
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    color: '#89a5dd',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // ── Content canvas ──
  canvas: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 16,
    gap: 16,
  },

  // Problem card
  problemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4c6d0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // Difference card
  differenceCard: {
    backgroundColor: 'rgba(122,179,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(122,179,255,0.25)',
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#191c1e',
  },
  secondaryText: {
    color: '#1960a6',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#44474f',
  },
  bold: {
    fontWeight: '700',
    color: '#191c1e',
  },

  // Feature list
  featureList: {
    marginTop: 16,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5bba40',
    marginTop: 4,
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#191c1e',
    letterSpacing: 0.3,
  },

  // CTA
  ctaButton: {
    height: 56,
    backgroundColor: '#1b3a6b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1b3a6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 11,
    color: '#747780',
    textTransform: 'uppercase',
    letterSpacing: 3,
    paddingVertical: 16,
  },
});
