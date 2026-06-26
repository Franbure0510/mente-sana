import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { MOOD_EMOJIS } from '@mentesana/shared';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [exercise, setExercise] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [moodBefore, setMoodBefore] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [showMoodBefore, setShowMoodBefore] = useState(true);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    api.exercises.get(id as string).then(setExercise).catch(() => router.back());
  }, [id]);

  useEffect(() => {
    if (!isActive || currentStep < 0) { clearInterval(intervalRef.current); return; }
    if (!exercise?.steps[currentStep]) { setIsActive(false); return; }
    const duration = exercise.steps[currentStep].duration;
    if (timer >= duration) {
      if (currentStep < exercise.steps.length - 1) {
        setCurrentStep(s => s + 1);
        setTimer(0);
      } else {
        setIsActive(false);
        setCompleted(true);
        api.exercises.complete(exercise.id, { moodBefore }).catch(() => {});
      }
      return;
    }
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive, timer, currentStep, exercise, moodBefore]);

  const startExercise = () => {
    setShowMoodBefore(false);
    setCurrentStep(0);
    setTimer(0);
    setIsActive(true);
  };

  if (!exercise) return <View style={styles.container}><Text>Cargando...</Text></View>;

  if (showMoodBefore) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emoji}>{exercise.icon}</Text>
        <Text style={styles.title}>{exercise.title}</Text>
        <Text style={styles.moodLabel}>¿Cómo te sientes antes de empezar?</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => { setMoodBefore(n); startExercise(); }}>
              <Text style={[styles.moodEmoji, moodBefore === n && styles.moodEmojiSelected]}>{MOOD_EMOJIS[n]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.completedEmoji}>🎉</Text>
        <Text style={styles.title}>¡Ejercicio completado!</Text>
        <Text style={styles.subtitle}>Bien hecho. Cada paso cuenta.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step = exercise.steps[currentStep];
  const remaining = step ? step.duration - timer : 0;

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.emoji}>{exercise.icon}</Text>
      <Text style={styles.title}>{exercise.title}</Text>
      {step && (
        <>
          <Text style={styles.timer}>{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}</Text>
          <Text style={styles.instruction}>{step.instruction}</Text>
          <Text style={styles.stepIndicator}>Paso {currentStep + 1} de {exercise.steps.length}</Text>
        </>
      )}
      {isActive ? (
        <TouchableOpacity style={styles.pauseButton} onPress={() => setIsActive(false)}>
          <Text style={styles.pauseText}>Pausar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={() => setIsActive(true)}>
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  center: { justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  timer: { fontSize: 48, fontWeight: 'bold', color: '#6366f1', marginBottom: 24 },
  instruction: { fontSize: 18, textAlign: 'center', marginBottom: 16, lineHeight: 28 },
  stepIndicator: { fontSize: 14, color: '#94a3b8', marginBottom: 32 },
  moodLabel: { fontSize: 16, fontWeight: '500', color: '#64748b', marginBottom: 16 },
  moodRow: { flexDirection: 'row', gap: 16 },
  moodEmoji: { fontSize: 40, opacity: 0.5, padding: 8 },
  moodEmojiSelected: { opacity: 1, transform: [{ scale: 1.2 }] },
  primaryButton: { backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 16 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pauseButton: { borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 16 },
  pauseText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  completedEmoji: { fontSize: 72, marginBottom: 16 },
});
