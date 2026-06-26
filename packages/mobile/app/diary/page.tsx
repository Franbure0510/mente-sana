import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { MOOD_EMOJIS, MOOD_LABELS } from '@mentesana/shared';

export default function DiaryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [e, s] = await Promise.all([api.diary.list(), api.diary.stats()]);
      setEntries(e);
      setStats(s);
    } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Diario emocional</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/diary/new')}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entradas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.avgMood}</Text>
            <Text style={styles.statLabel}>Ánimo promedio</Text>
          </View>
        </View>
      )}

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>Aún no tienes entradas</Text>
        </View>
      ) : (
        entries.map((entry: any) => (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryMood}>{MOOD_EMOJIS[entry.moodLevel]}</Text>
              <Text style={styles.entryMoodLabel}>{MOOD_LABELS[entry.moodLevel]}</Text>
              <Text style={styles.entryDate}>
                {new Date(entry.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <Text style={styles.entryThought}>{entry.thought}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#6366f1', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#6366f1' },
  statLabel: { fontSize: 12, color: '#64748b' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#64748b' },
  entry: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  entryMood: { fontSize: 24 },
  entryMoodLabel: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  entryDate: { fontSize: 12, color: '#64748b', marginLeft: 'auto' },
  entryThought: { fontSize: 14, color: '#475569' },
});
