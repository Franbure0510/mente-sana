import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    api.profile.get().then(setProfile).catch(() => {});
    api.profile.resources().then(setResources).catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.replace('/'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.nickname}>{profile?.nickname || 'Usuario'}</Text>
        <Text style={styles.streak}>🔥 {profile?.streakDays || 0} días seguidos</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>📖 {profile?.diaryCount || 0}</Text>
          <Text style={styles.statLabel}>entradas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>🧘 {profile?.exerciseCount || 0}</Text>
          <Text style={styles.statLabel}>ejercicios</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>📚 Recursos</Text>
      {resources.map((r: any) => (
        <View key={r.id} style={styles.resource}>
          <Text style={styles.resourceIcon}>
            {r.category === 'article' ? '📄' : r.category === 'video' ? '🎬' : '🎵'}
          </Text>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>{r.title}</Text>
            <Text style={styles.resourceDesc}>{r.description}</Text>
          </View>
        </View>
      ))}

      <View style={styles.crisisBanner}>
        <Text style={styles.crisisTitle}>🚨 Líneas de ayuda</Text>
        <Text style={styles.crisisText}>
          Si estás en crisis, llama al 911. No estás solo.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { fontSize: 64, marginBottom: 8 },
  nickname: { fontSize: 24, fontWeight: 'bold' },
  streak: { fontSize: 14, color: '#f59e0b', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#64748b' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  resource: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  resourceIcon: { fontSize: 28 },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '500' },
  resourceDesc: { fontSize: 12, color: '#64748b' },
  crisisBanner: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', padding: 16, borderRadius: 12, marginTop: 24, marginBottom: 16 },
  crisisTitle: { fontSize: 16, fontWeight: '600', color: '#92400e', marginBottom: 4 },
  crisisText: { fontSize: 14, color: '#b45309' },
  logoutButton: { borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
