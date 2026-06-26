import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { MOOD_EMOJIS } from '@mentesana/shared';

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [checkin, setCheckin] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [moodLevel, setMoodLevel] = useState(3);
  const [anxietyLevel, setAnxietyLevel] = useState(3);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) { router.replace('/'); return; }
    setUser(JSON.parse(savedUser));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [c, s, p] = await Promise.all([
        api.checkin.today(),
        api.diary.stats(),
        api.profile.get(),
        api.profile.streak(),
      ]);
      setCheckin(c);
      setStats(s);
      setProfile(p);
    } catch {}
  };

  const handleCheckin = async () => {
    try {
      await api.checkin.create({ moodLevel, anxietyLevel });
      const updated = await api.checkin.today();
      setCheckin(updated);
      setShowCheckin(false);
      loadData();
    } catch { Alert.alert('Error', 'No se pudo guardar el check-in'); }
  };

  const ANXIETY_EMOJIS = ['😌', '🙂', '😐', '😟', '😰'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hola, {profile?.nickname || user?.nickname} 🌿</Text>
      {profile?.streakDays ? (
        <Text style={styles.streak}>🔥 Llevas {profile.streakDays} días seguidos</Text>
      ) : (
        <Text style={styles.streak}>Hoy es un nuevo comienzo</Text>
      )}

      {!checkin && !showCheckin && (
        <View style={styles.checkinBanner}>
          <Text style={styles.checkinTitle}>¿Cómo estás hoy?</Text>
          <Text style={styles.checkinSubtitle}>Haz tu check-in diario</Text>
          <TouchableOpacity style={styles.checkinButton} onPress={() => setShowCheckin(true)}>
            <Text style={styles.checkinButtonText}>Hacer check-in</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCheckin && (
        <View style={styles.checkinForm}>
          <Text style={styles.sectionTitle}>Tu estado de ánimo</Text>
          <View style={styles.emojiRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setMoodLevel(n)}>
                <Text style={[styles.emoji, moodLevel === n && styles.emojiSelected]}>{MOOD_EMOJIS[n]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Nivel de ansiedad</Text>
          <View style={styles.emojiRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setAnxietyLevel(n)}>
                <Text style={[styles.emoji, anxietyLevel === n && styles.emojiSelected]}>{ANXIETY_EMOJIS[n - 1]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCheckin}>
            <Text style={styles.primaryButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      {checkin && (
        <View style={styles.checkinDone}>
          <Text style={styles.checkinDoneText}>
            ✅ Check-in completado — Ánimo: {MOOD_EMOJIS[checkin.moodLevel]} | Ansiedad: {ANXIETY_EMOJIS[checkin.anxietyLevel - 1]}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/diary/new')}>
          <Text style={styles.cardEmoji}>📖</Text>
          <Text style={styles.cardTitle}>Nueva entrada</Text>
          <Text style={styles.cardSubtitle}>Escribe cómo te sientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/exercises')}>
          <Text style={styles.cardEmoji}>🧘</Text>
          <Text style={styles.cardTitle}>Ejercicios</Text>
          <Text style={styles.cardSubtitle}>{stats?.totalEntries || 0} sesiones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/chat')}>
          <Text style={styles.cardEmoji}>🤖</Text>
          <Text style={styles.cardTitle}>Chat IA</Text>
          <Text style={styles.cardSubtitle}>Habla con tu asistente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Recuerda: esto no reemplaza la ayuda profesional.</Text>
        <Text style={styles.footerText}>Si estás en crisis, contacta una línea de ayuda 💚</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  streak: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  checkinBanner: { backgroundColor: '#6366f1', padding: 20, borderRadius: 16, marginBottom: 20 },
  checkinTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  checkinSubtitle: { fontSize: 14, color: '#c7d2fe', marginBottom: 12 },
  checkinButton: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  checkinButtonText: { color: '#6366f1', fontWeight: '600' },
  checkinForm: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 8, marginTop: 8 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  emoji: { fontSize: 36, opacity: 0.5, padding: 8 },
  emojiSelected: { opacity: 1, transform: [{ scale: 1.2 }] },
  primaryButton: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  checkinDone: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', padding: 14, borderRadius: 12, marginBottom: 20 },
  checkinDoneText: { color: '#166534', fontSize: 14 },
  grid: { gap: 12, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  cardSubtitle: { fontSize: 13, color: '#64748b' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
});
