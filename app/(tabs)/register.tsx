import { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '@/context/AuthContext/AuthContext';
import { logEvent } from '@/utils/analyticsService';

// ─── Legal Modal ──────────────────────────────────────────────────────────────

type LegalType = 'terms' | 'privacy' | null;

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES DE USO
Última actualización: mayo 2025

1. ACEPTACIÓN
Al usar Sabana Inteligente aceptas estos términos. Si no estás de acuerdo, no uses la app.

2. USO PERMITIDO
La app es para uso personal, no comercial. Está diseñada para optimizar desplazamientos en la región Sabana Centro de Colombia.

3. DATOS DE TRÁFICO
La información de tráfico proviene de Google Directions API. Los tiempos son estimaciones y pueden variar. La app no garantiza tiempos exactos de llegada.

4. NOTIFICACIONES
Al activar notificaciones, aceptas recibir alertas de salida para tus viajes planificados. Puedes desactivarlas en cualquier momento.

5. CUENTA DE USUARIO
Eres responsable de mantener la confidencialidad de tu contraseña. Notifica inmediatamente cualquier uso no autorizado de tu cuenta.

6. LIMITACIÓN DE RESPONSABILIDAD
Sabana Inteligente no es responsable por accidentes, retrasos o pérdidas derivadas del uso de la información proporcionada. Siempre conduce con precaución y respeta las normas de tránsito.

7. PROPIEDAD INTELECTUAL
Todo el contenido, diseño y código de la app es propiedad del equipo de desarrollo. Proyecto de grado — Universidad de La Sabana, 2025.

8. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos con previo aviso de 15 días.

9. CONTACTO
Para consultas: train.myp@gmail.com`;

const PRIVACY_TEXT = `POLÍTICA DE PRIVACIDAD
Última actualización: mayo 2025

1. DATOS QUE RECOPILAMOS
• Nombre completo y correo electrónico (registro)
• Viajes planificados (origen, destino, hora)
• Preferencias de notificaciones
• Datos de uso anónimos para mejorar la app

2. CÓMO USAMOS TUS DATOS
• Para calcular rutas y tiempos de salida personalizados
• Para enviar notificaciones de viaje
• Para generar tu historial de impacto (CO₂, tiempo ahorrado)
• Nunca vendemos tus datos a terceros

3. ALMACENAMIENTO
Los datos se almacenan en Firebase (Google Cloud) con cifrado en tránsito y en reposo. Cumplimos con los estándares de seguridad de Google Cloud.

4. APIS DE TERCEROS
Usamos Google Directions API y Google Gemini AI. Sus políticas de privacidad aplican para los datos enviados a estos servicios (coordenadas de origen/destino).

5. TUS DERECHOS (Ley 1581 de 2012 — Colombia)
• Conocer, actualizar y rectificar tu información
• Solicitar prueba de la autorización otorgada
• Ser informado del uso de tus datos
• Revocar la autorización y solicitar supresión de datos

6. ELIMINACIÓN DE DATOS
Para eliminar tu cuenta y datos, contáctanos en: train.myp@gmail.com

7. MENORES
La app no está dirigida a menores de 14 años. No recopilamos intencionalmente datos de menores.

8. CONTACTO
Responsable del tratamiento: Equipo Sabana Inteligente
Correo: train.myp@gmail.com`;

function LegalModal({ type, onClose }: { type: LegalType; onClose: () => void }) {
  return (
    <Modal visible={type !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={legalStyles.overlay}>
        <View style={legalStyles.sheet}>
          <View style={legalStyles.handle} />
          <View style={legalStyles.header}>
            <Text style={legalStyles.title}>
              {type === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color="#747780" />
            </TouchableOpacity>
          </View>
          <ScrollView style={legalStyles.body} showsVerticalScrollIndicator={false}>
            <Text style={legalStyles.text}>
              {type === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
            </Text>
          </ScrollView>
          <TouchableOpacity style={legalStyles.acceptBtn} onPress={onClose} activeOpacity={0.88}>
            <Text style={legalStyles.acceptText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const legalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingBottom: 32, paddingHorizontal: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#c4c6d0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1B3A6B', flex: 1 },
  body: { flex: 1 },
  text: { fontSize: 13, color: '#44474f', lineHeight: 22 },
  acceptBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#1B3A6B', alignItems: 'center',
  },
  acceptText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default function RegisterScreen() {
  const { signUp } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalType>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Background decorations */}
      <View style={styles.bgDecoBottomLeft} pointerEvents="none" />
      <View style={styles.bgDecoTopRight} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3A6B" />
          <Text style={styles.headerTitle}>Sabana Inteligente</Text>
        </TouchableOpacity>
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
          {/* Logo icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <MaterialIcons name="navigation" size={36} color="#89a5dd" />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Únete a la navegación inteligente</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full name */}
            <View style={styles.field}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre real"
                  placeholderTextColor="#9EA3AC"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="mail" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nombre@ejemplo.com"
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
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadRight]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9EA3AC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#747780"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color="#747780" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#9EA3AC"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
              </View>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptedTerms(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <MaterialIcons name="check" size={13} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text style={styles.termsLink} onPress={() => setLegalModal('terms')}>
                  términos y condiciones
                </Text>
                {' '}y la{' '}
                <Text style={styles.termsLink} onPress={() => setLegalModal('privacy')}>
                  política de privacidad
                </Text>
                .
              </Text>
            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.88}
              disabled={loading}
              onPress={async () => {
                if (!fullName || !email || !password || !confirmPassword) {
                  Alert.alert('Error', 'Completa todos los campos');
                  return;
                }
                if (fullName.trim().length < 3) {
                  Alert.alert('Error', 'Ingresa tu nombre completo');
                  return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  Alert.alert('Error', 'Ingresa un correo electrónico válido');
                  return;
                }
                if (password.length < 8) {
                  Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
                  return;
                }
                if (!/[A-Z]/.test(password)) {
                  Alert.alert('Error', 'La contraseña debe tener al menos una letra mayúscula');
                  return;
                }
                if (!/[0-9]/.test(password)) {
                  Alert.alert('Error', 'La contraseña debe tener al menos un número');
                  return;
                }
                if (password !== confirmPassword) {
                  Alert.alert('Error', 'Las contraseñas no coinciden');
                  return;
                }
                if (!acceptedTerms) {
                  Alert.alert('Error', 'Debes aceptar los términos y condiciones');
                  return;
                }
                setLoading(true);
                const ok = await signUp(email, password, fullName);
                setLoading(false);
                if (ok) {
                  logEvent('register', {});
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  router.push('/register-success' as any);
                } else {
                  Alert.alert('Error', 'No se pudo crear la cuenta. El correo puede estar en uso.');
                }
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Registrarse</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Social register */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>o regístrate con</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
                <AntDesign name="google" size={20} color="#EA4335" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
                <FontAwesome name="facebook" size={20} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.loginLink} onPress={() => router.push('/login')}>
              Inicia sesión
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  flex: {
    flex: 1,
  },

  bgDecoBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#7ab3ff',
    opacity: 0.1,
  },
  bgDecoTopRight: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1b3a6b',
    opacity: 0.05,
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
    fontWeight: '600',
    fontSize: 18,
    color: '#1B3A6B',
    letterSpacing: -0.2,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  logoContainer: {
    marginBottom: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#191c1e',
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#44474f',
    textAlign: 'center',
    marginTop: 4,
  },

  form: {
    width: '100%',
    gap: 16,
  },

  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: '#44474f',
    marginLeft: 4,
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

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C5CDD8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#1960a6',
    borderColor: '#1960a6',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#44474f',
  },
  termsLink: {
    color: '#1960a6',
    fontWeight: '600',
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1B3A6B',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },

  socialSection: {
    width: '100%',
    marginTop: 32,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C5CDD8',
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#747780',
    marginHorizontal: 12,
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
    paddingVertical: 12,
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
    marginTop: 32,
    fontSize: 14,
    color: '#44474f',
    textAlign: 'center',
  },
  loginLink: {
    color: '#185FA5',
    fontWeight: '700',
  },
});
