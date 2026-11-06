'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS } from '@mentesana/shared';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

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

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;
  if (!exercise) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando ejercicio...</div>;

  const step = exercise.steps[currentStep];

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[720px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} className="flex items-center gap-2 mb-8">
          <Link href="/exercises" className="liquid-glass rounded-full w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">←</Link>
          <span className="text-[11px] tracking-[0.16em] uppercase text-white/30 font-body">Ejercicios</span>
          <span className="text-white/20 text-xs">/</span>
          <span className="text-xs text-white/60 font-body truncate">{exercise.title}</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {showMoodBefore ? (
            <motion.div
              key="mood-before"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
              className="text-center"
            >
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }} className="liquid-glass-strong w-20 h-20 rounded-[1.25rem] inline-flex items-center justify-center text-[40px] mb-5">
                {exercise.icon}
              </motion.div>
              <h1 className="font-heading italic text-[2rem] md:text-[2.6rem] leading-[0.9] tracking-[-1px] text-white">{exercise.title}</h1>
              <p className="text-sm text-white/50 font-body font-light leading-relaxed max-w-[38ch] mx-auto mt-3">{exercise.description}</p>
              <div className="flex justify-center gap-2 mt-4">
                <span className="liquid-glass rounded-full px-3 py-1.5 text-xs text-white/60 font-body">⏱ {exercise.duration} min</span>
                <span className="liquid-glass rounded-full px-3 py-1.5 text-xs text-white/60 font-body">📋 {exercise.steps?.length || 0} pasos</span>
              </div>

              <div className="liquid-glass-strong rounded-[1.5rem] p-7 md:p-8 mt-8 max-w-[420px] mx-auto">
                <p className="text-[11px] tracking-[0.16em] uppercase text-white/40 font-body mb-1">Antes de comenzar</p>
                <p className="font-heading italic text-xl leading-none tracking-[-0.4px] text-white mb-6">¿Cómo te sientes?</p>
                <div className="flex justify-center gap-2 md:gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => { setMoodBefore(n); startExercise(); }}
                      className={`w-[56px] h-[64px] md:w-[62px] md:h-[70px] rounded-[1rem] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border ${moodBefore === n ? 'liquid-glass-strong border-white/15 scale-[1.02]' : 'liquid-glass border-transparent hover:border-white/10'}`}
                    >
                      <span className="text-[26px] leading-none">{MOOD_EMOJIS[n as keyof typeof MOOD_EMOJIS]}</span>
                      <span className="text-[10px] text-white/35 font-body">{n}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 font-body mt-4">Toca un emoji para empezar</p>
              </div>

              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {exercise.steps?.slice(0, 4).map((s: any, i: number) => (
                  <span key={i} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/35 font-body truncate max-w-[160px]">{i + 1}. {s.title || s.instruction?.slice(0, 22)}</span>
                ))}
                {(exercise.steps?.length || 0) > 4 && <span className="text-[11px] text-white/25 font-body self-center">+{exercise.steps.length - 4} más</span>}
              </div>
            </motion.div>
          ) : completed ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full liquid-glass-strong flex items-center justify-center text-3xl mx-auto mb-5 border border-emerald-400/20">🎉</div>
              <h1 className="font-heading italic text-[2rem] md:text-[2.4rem] leading-none tracking-[-1px] text-white">¡Ejercicio completado!</h1>
              <p className="text-sm text-white/50 font-body font-light mt-2">Bien hecho. Cada paso cuenta.</p>

              <div className="liquid-glass-strong rounded-[1.5rem] p-7 md:p-8 mt-8 max-w-[420px] mx-auto">
                <p className="text-[11px] tracking-[0.16em] uppercase text-white/40 font-body mb-1">Reflexión final</p>
                <p className="font-heading italic text-xl leading-none tracking-[-0.4px] text-white mb-6">¿Cómo te sientes ahora?</p>
                <div className="flex justify-center gap-2 md:gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={async () => {
                        setMoodAfter(n);
                        await api.exercises.complete(exercise.id, { moodBefore, moodAfter: n }).catch(() => {});
                        router.push('/exercises');
                      }}
                      className="w-[56px] h-[64px] md:w-[62px] md:h-[70px] rounded-[1rem] liquid-glass border border-transparent hover:border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.04]"
                    >
                      <span className="text-[26px] leading-none">{MOOD_EMOJIS[n as keyof typeof MOOD_EMOJIS]}</span>
                      <span className="text-[10px] text-white/35 font-body">{n}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 font-body mt-4">Tu respuesta se guarda de forma anónima</p>
              </div>

              <button onClick={() => router.push('/exercises')} className="mt-6 bg-white text-black rounded-full px-7 py-3 font-medium text-sm font-body hover:bg-white/90 transition-colors cursor-pointer">
                ← Volver a ejercicios
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-[11px] tracking-[0.14em] uppercase text-white/30 font-body">Paso {currentStep + 1} de {exercise.steps.length}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs text-white/50 font-body flex items-center gap-1.5"><span className="text-sm leading-none">{exercise.icon}</span> {exercise.title}</span>
              </div>

              <div className="flex justify-center gap-1.5 mb-6">
                {exercise.steps.map((_: any, i: number) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i < currentStep ? 'w-8 bg-white' : i === currentStep ? 'w-10 bg-white' : 'w-6 bg-white/15'}`} />
                ))}
              </div>

              {step && (
                <div className="liquid-glass-strong rounded-[1.5rem] p-8 md:p-10 min-h-[320px] flex flex-col items-center justify-center">
                  <div className="font-heading italic text-[3.2rem] md:text-[4rem] leading-none tracking-[-2px] text-white">
                    {Math.floor((step.duration - timer) / 60)}:{String((step.duration - timer) % 60).padStart(2, '0')}
                  </div>
                  <div className="w-[120px] h-1.5 rounded-full bg-white/10 mt-4 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-white" initial={{ width: '100%' }} animate={{ width: `${((step.duration - timer) / step.duration) * 100}%` }} transition={{ duration: 1, ease: 'linear' }} />
                  </div>
                  <p className="font-heading italic text-[1.35rem] md:text-[1.55rem] leading-tight tracking-[-0.4px] text-white max-w-[34ch] mt-8">{step.instruction}</p>
                  {step.title && <p className="text-[11px] tracking-[0.12em] uppercase text-white/30 font-body mt-3">{step.title}</p>}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                {isActive ? (
                  <button onClick={() => setIsActive(false)} className="liquid-glass rounded-full px-7 py-3 text-sm font-medium text-white/80 hover:text-white font-body cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" /> ⏸ Pausar
                  </button>
                ) : (
                  <button onClick={() => setIsActive(true)} className="bg-white text-black rounded-full px-7 py-3 text-sm font-medium font-body hover:bg-white/90 transition-colors cursor-pointer">▶ Continuar</button>
                )}
                <button onClick={() => { setIsActive(false); setCompleted(true); }} className="text-xs text-white/30 hover:text-white/60 font-body cursor-pointer px-3 py-2 transition-colors">
                  Saltar al final →
                </button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => { if (currentStep > 0) { setCurrentStep(s => s - 1); setTimer(0); } }} disabled={currentStep === 0} className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-sm">‹</button>
                <button onClick={() => { if (currentStep < exercise.steps.length - 1) { setCurrentStep(s => s + 1); setTimer(0); } else { setIsActive(false); setCompleted(true); api.exercises.complete(exercise.id, { moodBefore, moodAfter }).catch(() => {}); } }} className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white/50 hover:text-white cursor-pointer text-sm">›</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
