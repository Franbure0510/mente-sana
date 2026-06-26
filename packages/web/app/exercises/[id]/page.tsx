'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS } from '@mentesana/shared';

export default function ExerciseDetail() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [exercise, setExercise] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [showMoodBefore, setShowMoodBefore] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user || !params.id) return;
    api.exercises.get(params.id as string).then(setExercise).catch(() => router.push('/exercises'));
  }, [user, isLoading, router, params.id]);

  useEffect(() => {
    if (!isActive || currentStep < 0) return;
    if (!exercise?.steps[currentStep]) { setIsActive(false); return; }
    const duration = exercise.steps[currentStep].duration;
    if (timer >= duration) {
      if (currentStep < exercise.steps.length - 1) {
        setCurrentStep(s => s + 1);
        setTimer(0);
      } else {
        setIsActive(false);
        setCompleted(true);
        api.exercises.complete(exercise.id, { moodBefore, moodAfter }).catch(() => {});
      }
      return;
    }
    const t = setTimeout(() => setTimer(t => t + 1), 1000);
    return () => clearTimeout(t);
  }, [isActive, timer, currentStep, exercise, moodBefore, moodAfter]);

  const startExercise = () => {
    setShowMoodBefore(false);
    setCurrentStep(0);
    setTimer(0);
    setIsActive(true);
  };

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando...</div>;
  if (!user) return null;
  if (!exercise) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.35)' }}>Cargando ejercicio...</div>;

  if (showMoodBefore) {
    return (
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 32 }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 16 }}>
          {exercise.icon}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{exercise.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 320, margin: '0 auto 20px', lineHeight: 1.6 }}>{exercise.description}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
          <span>⏱ {exercise.duration} min</span>
          <span>📋 {exercise.steps?.length || 0} pasos</span>
        </div>
        <div style={{ maxWidth: 280, margin: '0 auto', background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 500 }}>¿Cómo te sientes antes de empezar?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => { setMoodBefore(n); startExercise(); }}
                style={{
                  fontSize: 28, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: moodBefore === n ? 'rgba(168,85,247,0.12)' : 'transparent',
                  transform: moodBefore === n ? 'scale(1.15)' : 'scale(1)',
                  opacity: moodBefore === n ? 1 : 0.4,
                }}>
                {MOOD_EMOJIS[n]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 48 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20, border: '1px solid rgba(16,185,129,0.15)' }}>
          🎉
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>¡Ejercicio completado!</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>Bien hecho. Cada paso cuenta.</p>
        <div style={{ maxWidth: 280, margin: '0 auto', background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 500 }}>¿Cómo te sientes ahora?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={async () => {
                setMoodAfter(n);
                await api.exercises.complete(exercise.id, { moodBefore, moodAfter: n }).catch(() => {});
                router.push('/exercises');
              }}
                style={{ fontSize: 28, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: 'transparent', opacity: 0.6 }}>
                {MOOD_EMOJIS[n]}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => router.push('/exercises')} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(168,85,247,0.25)' }}>
          ← Volver a ejercicios
        </button>
      </div>
    );
  }

  const step = exercise.steps[currentStep];

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
        {exercise.icon} {exercise.title}
      </div>

      {step && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 40, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#a855f7', letterSpacing: '-1px', marginBottom: 8 }}>
            {Math.floor((step.duration - timer) / 60)}:{String((step.duration - timer) % 60).padStart(2, '0')}
          </div>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(168,85,247,0.15)', marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: '#a855f7', transition: 'width 1s linear', width: `${((step.duration - timer) / step.duration) * 100}%` }} />
          </div>
          <p style={{ fontSize: 18, color: '#fff', lineHeight: 1.6, maxWidth: 340, margin: 0 }}>{step.instruction}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>Paso {currentStep + 1} de {exercise.steps.length}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        {isActive ? (
          <button onClick={() => setIsActive(false)} style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 28px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            ⏸ Pausar
          </button>
        ) : currentStep >= 0 ? (
          <button onClick={() => setIsActive(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(168,85,247,0.25)' }}>
            ▶ Continuar
          </button>
        ) : null}
        <button onClick={() => { setIsActive(false); setCompleted(true); }} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none', padding: '4px 12px' }}>
          Saltar al final →
        </button>
      </div>
    </div>
  );
}
