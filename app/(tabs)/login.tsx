import { useState } from 'react';
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
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Background decorations */}
      <View style={styles.bgDecoTop} pointerEvents="none" />
      <View style={styles.bgDecoBottom} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sabana Inteligente</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero branding */}
          <View style={styles.hero}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="rocket" size={40} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.heroSubtitle}>
              Accede a tus rutas y reportes de tráfico en tiempo real.
            </Text>
          </View>

          {/* Login form card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="mail" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@sabana.com"
                  placeholderTextColor="#9EA3AC"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadRight]}
                  placeholder="••••••••"
                  placeholderTextColor="#9EA3AC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#747780"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.88}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.submitText}>Iniciar Sesión</Text>
              <MaterialIcons name="login" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>O continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
                <AntDesign name="google" size={20} color="#EA4335" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign up footer */}
          <Text style={styles.footerText}>
            ¿No tienes una cuenta?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/register')}>
              Regístrate gratis
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  flex: {
    flex: 1,
  },

  bgDecoTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#7ab3ff',
    opacity: 0.15,
  },
  bgDecoBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#d7e2ff',
    opacity: 0.15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C5CDD8',
    backgroundColor: '#F4F6F8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1B3A6B',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 32,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },

  hero: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#002452',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#44474f',
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#44474f',
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forgotLink: {
    fontWeight: '600',
    fontSize: 12,
    color: '#185FA5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C5CDD8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#191c1e',
  },
  inputPadRight: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#185FA5',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C5CDD8',
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#44474f',
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C5CDD8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  socialText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#191c1e',
  },

  footerText: {
    marginTop: 24,
    fontSize: 14,
    color: '#44474f',
    textAlign: 'center',
  },
  signupLink: {
    color: '#185FA5',
    fontWeight: '600',
  },
});
