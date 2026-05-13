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

export default function RegisterSuccessScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          <Text style={styles.headerTitle}>Sabana Inteligente</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <View style={styles.card}>
          {/* Success icon area */}
          <View style={styles.successIconArea}>
            <View style={styles.successIconBg}>
              <MaterialIcons name="check-circle" size={64} color="#2D751A" />
            </View>
          </View>

          {/* Title & subtitle */}
          <Text style={styles.title}>¡Cuenta creada con éxito!</Text>
          <Text style={styles.subtitle}>
            Ahora estás listo para navegar la Sabana con confianza.
          </Text>

          {/* CTA button */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.ctaText}>Comenzar ahora</Text>
          </TouchableOpacity>

          {/* Feature card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIconBox}>
              <MaterialIcons name="map" size={24} color="#00447e" />
            </View>
            <View style={styles.featureTextBlock}>
              <Text style={styles.featureTitle}>Rutas en tiempo real</Text>
              <Text style={styles.featureDesc}>
                Optimiza tu tiempo con datos precisos de tráfico local.
              </Text>
            </View>
          </View>

          {/* Landscape placeholder */}
          <View style={styles.landscapePlaceholder}>
            <MaterialIcons name="terrain" size={48} color="#B0B8C4" />
            <Text style={styles.landscapeLabel}>Sabana Centro</Text>
            {/* Gradient overlay simulation */}
            <View style={styles.landscapeOverlay} />
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2024 Movilidad Sabana Centro</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C5CDD8',
    backgroundColor: '#F4F6F8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
    color: '#1B3A6B',
    letterSpacing: -0.2,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 24,
  },

  card: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    padding: 32,
    alignItems: 'center',
  },

  // Success icon area
  successIconArea: {
    width: '100%',
    height: 128,
    borderRadius: 8,
    backgroundColor: '#EBF5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  successIconBg: {
    backgroundColor: '#EBF5E9',
    padding: 16,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  title: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#002452',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#44474f',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  ctaButton: {
    width: '100%',
    backgroundColor: '#1B3A6B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },

  // Feature card
  featureCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fb',
    marginBottom: 24,
  },
  featureIconBox: {
    backgroundColor: '#d4e3ff',
    padding: 8,
    borderRadius: 8,
  },
  featureTextBlock: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#002452',
    marginBottom: 4,
  },
  featureDesc: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    color: '#44474f',
  },

  // Landscape placeholder
  landscapePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    backgroundColor: '#e6e8ea',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  landscapeLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#9EA3AC',
    fontWeight: '500',
  },
  landscapeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  footer: {
    marginTop: 24,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
