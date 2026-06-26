import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '📋' },
  { key: 'breathing', label: 'Respiración', icon: '🫁' },
  { key: 'meditation', label: 'Meditación', icon: '🧘' },
  { key: 'cbt', label: 'TCC', icon: '🧠' },
  { key: 'grounding', label: 'Grounding', icon: '🌍' },
  { key: 'relaxation', label: 'Relajación', icon: '💆' },
];

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.exercises.list().then(setExercises).catch(() => {});
  }, []);

  const filtered = category === 'all' ? exercises : exercises.filter((e: any) => e.category === category);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🧘 Ejercicios guiados</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.key} onPress={() => setCategory(cat.key)}
            style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}>
            <Text style={[styles.categoryText, category === cat.key && styles.categoryTextActive]}>
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((ex: any) => (
        <TouchableOpacity key={ex.id} style={styles.card} onPress={() => router.push(`/exercises/${ex.id}`)}>
          <Text style={styles.cardEmoji}>{ex.icon}</Text>
          <Text style={styles.cardTitle}>{ex.title}</Text>
          <Text style={styles.cardDesc}>{ex.description}</Text>
          <Text style={styles.cardMeta}>⏱ {ex.duration} min · {ex.steps?.length || 0} pasos</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  categories: { marginBottom: 16 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8, backgroundColor: '#fff' },
  categoryChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  categoryText: { fontSize: 14, color: '#64748b' },
  categoryTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
});
