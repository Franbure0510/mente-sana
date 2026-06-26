import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { MOOD_EMOJIS, MOOD_LABELS, EMOTIONS } from '@mentesana/shared';

export default function NewDiaryEntryScreen() {
  const [moodLevel, setMoodLevel] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [rationalThought, setRationalThought] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleEmotion = (id: string) => {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!thought.trim()) { Alert.alert('Campo requerido', 'Escribe tu pensamiento'); return; }
    setSaving(true);
    try {
      await api.diary.create({ moodLevel, emotions: selectedEmotions, thought, rationalThought });
      router.back();
    } catch { Alert.alert('Error', 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📝 Nueva entrada</Text>

      <Text style={styles.label}>¿Cómo te sientes?</Text>
      <View style={styles.moodRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity key={n} onPress={() => setMoodLevel(n)} style={styles.moodItem}>
            <Text style={[styles.moodEmoji, moodLevel === n && styles.moodSelected]}>{MOOD_EMOJIS[n]}</Text>
            <Text style={styles.moodLabel}>{MOOD_LABELS[n]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>¿Qué emociones sientes?</Text>
      <View style={styles.emotionGrid}>
        {EMOTIONS.map(em => (
          <TouchableOpacity key={em.id} onPress={() => toggleEmotion(em.id)}
            style={[styles.emotionChip, selectedEmotions.includes(em.id) && styles.emotionChipSelected]}>
            <Text style={styles.emotionChipText}>{em.emoji} {em.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>¿Qué pensamiento tienes?</Text>
      <TextInput style={styles.textArea} value={thought} onChangeText={setThought} placeholder="Escribe lo que estás pensando..." multiline />

      <Text style={styles.label}>Pensamiento racional (opcional)</Text>
      <TextInput style={styles.textArea} value={rationalThought} onChangeText={setRationalThought} placeholder="Reestructura tu pensamiento..." multiline />

      <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.5 }]} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitButtonText}>{saving ? 'Guardando...' : 'Guardar entrada'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 8, marginTop: 16 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { alignItems: 'center' },
  moodEmoji: { fontSize: 32, opacity: 0.5, padding: 4 },
  moodSelected: { opacity: 1, transform: [{ scale: 1.15 }] },
  moodLabel: { fontSize: 10, color: '#64748b' },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  emotionChipSelected: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  emotionChipText: { fontSize: 14, color: '#475569' },
  textArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
