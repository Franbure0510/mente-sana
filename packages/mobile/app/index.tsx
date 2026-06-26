import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌿</Text>
      <Text style={styles.title}>Mente Sana</Text>
      <Text style={styles.subtitle}>
        Tu espacio seguro para el bienestar emocional
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.secondaryButtonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#6366f1', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  primaryButton: { backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 16, marginBottom: 12, width: '100%' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryButton: { borderColor: '#6366f1', borderWidth: 2, paddingVertical: 14, paddingHorizontal: 48, borderRadius: 16, width: '100%' },
  secondaryButtonText: { color: '#6366f1', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
