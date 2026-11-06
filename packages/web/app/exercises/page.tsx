'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '📋' },
  { key: 'breathing', label: 'Respiración', icon: '🫁' },
  { key: 'meditation', label: 'Meditación', icon: '🧘' },
  { key: 'cbt', label: 'TCC', icon: '🧠' },
  { key: 'grounding', label: 'Grounding', icon: '🌍' },
  { key: 'relaxation', label: 'Relajación', icon: '💆' },
];

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function ExercisesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.exercises.list().then(setExercises).catch(() => {});
    api.exercises.history().then(setHistory).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  const filtered = category === 'all' ? exercises : exercises.filter((e: any) => e.category === category);
  const completedIds = new Set(history.map((s: any) => s.exerciseId));

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1120px] mx-auto px-6 md:px-10 lg:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/40 font-body mb-2">Prácticas guiadas · TCC · Mindfulness</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading italic text-[2.6rem] md:text-[3.4rem] leading-[0.9] tracking-[-1.5px] text-white">Ejercicios</h1>
              <p className="font-heading italic text-xl md:text-2xl text-white/60 tracking-[-0.5px] -mt-1">guiados para ti</p>
              <p className="text-sm text-white/45 font-body font-light mt-2 max-w-[42ch]">Técnicas basadas en TCC, mindfulness y respiración — a tu ritmo.</p>
            </div>
            <Link href="/dashboard" className="hidden md:inline-flex liquid-glass rounded-full px-4 py-2 items-center gap-2 text-xs text-white/70 hover:text-white font-body transition-colors shrink-0">
              <span className="w-2 h-2 rounded-full bg-white/40" /> Volver al dashboard
            </Link>
          </div>
        </motion.div>

        {history.length > 0 && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="liquid-glass rounded-[1.25rem] px-5 py-4 flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl liquid-glass-strong flex items-center justify-center text-lg shrink-0">🎯</div>
            <div>
              <p className="text-sm text-white/80 font-body">Has completado <span className="font-heading italic text-white text-[1.1rem] tracking-[-0.3px]">{history.length}</span> ejercicios</p>
              <p className="text-xs text-white/40 font-body">Cada práctica suma — sigue así.</p>
            </div>
            <span className="ml-auto hidden md:inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-white/30 font-body">Progreso guardado</span>
          </motion.div>
        )}

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium font-body cursor-pointer transition-all border ${category === cat.key ? 'bg-white text-black border-white shadow-[0_4px_20px_rgba(255,255,255,0.15)]' : 'liquid-glass text-white/60 hover:text-white border-transparent hover:border-white/10'}`}
            >
              <span className="text-[15px] leading-none">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ex: any, i: number) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any, delay: 0.16 + i * 0.06 }}
            >
              <Link href={`/exercises/${ex.id}`} className="group liquid-glass rounded-[1.5rem] p-6 flex flex-col min-h-[186px] hover:scale-[1.01] transition-transform block relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-[1rem] liquid-glass-strong flex items-center justify-center text-2xl shrink-0">{ex.icon}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    {completedIds.has(ex.id) && (
                      <span className="liquid-glass-strong rounded-full px-2.5 py-1 text-[11px] font-medium text-emerald-300 flex items-center gap-1">✓ Completado</span>
                    )}
                    <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center text-white/60 text-xs transition-colors">↗</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-heading italic text-[1.35rem] leading-none tracking-[-0.5px] text-white">{ex.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/50 font-body font-light mt-2 line-clamp-2">{ex.description}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-3 text-[11px] font-body">
                  <span className="liquid-glass rounded-full px-2.5 py-1 text-white/60 flex items-center gap-1.5">⏱ {ex.duration} min</span>
                  <span className="liquid-glass rounded-full px-2.5 py-1 text-white/60">📋 {ex.steps?.length || 0} pasos</span>
                  <span className="ml-auto capitalize liquid-glass rounded-full px-2.5 py-1 text-white/40 tracking-wide">{ex.category}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="liquid-glass rounded-[1.25rem] p-10 text-center mt-4">
            <p className="font-heading italic text-xl text-white/70">Sin resultados</p>
            <p className="text-sm text-white/40 font-body mt-1">Prueba con otra categoría.</p>
          </div>
        )}

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="text-center pt-10 mt-10 border-t border-white/[0.06]">
          <p className="text-[11px] tracking-wide text-white/30 font-body">💚 Herramienta de apoyo — no reemplaza ayuda profesional</p>
        </motion.div>
      </div>
    </div>
  );
}
