'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS, MOOD_LABELS } from '@mentesana/shared';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function DiaryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.diary.list().then(setEntries).catch(() => {});
    api.diary.stats().then(setStats).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[720px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/40 font-body mb-2">Diario · Espacio seguro</p>
            <h1 className="font-heading italic text-[2.2rem] md:text-[2.7rem] leading-[0.9] tracking-[-1.2px] text-white">Diario emocional</h1>
            <p className="font-body text-[13px] text-white/50 font-light mt-2">Registra cómo evolucionan tus emociones</p>
          </div>
          <Link href="/diary/new" className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3 text-sm font-medium font-body hover:bg-white/90 transition-colors">
            + Nueva entrada
          </Link>
        </motion.div>

        {stats && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="grid grid-cols-2 gap-4 mb-8">
            <div className="liquid-glass rounded-[1.25rem] p-6 text-center">
              <div className="font-heading italic text-[2.2rem] leading-none tracking-[-1px] text-white">{stats.totalEntries}</div>
              <div className="text-[11px] tracking-[0.14em] uppercase text-white/45 font-body mt-2">Entradas totales</div>
            </div>
            <div className="liquid-glass rounded-[1.25rem] p-6 text-center">
              <div className="font-heading italic text-[2.2rem] leading-none tracking-[-1px] text-white">{stats.avgMood}</div>
              <div className="text-[11px] tracking-[0.14em] uppercase text-white/45 font-body mt-2">Ánimo promedio</div>
            </div>
          </motion.div>
        )}

        {entries.length === 0 ? (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }} className="liquid-glass-strong rounded-[1.25rem] p-10 md:p-12 text-center">
            <div className="w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center text-2xl mx-auto mb-4">📝</div>
            <h3 className="font-heading italic text-xl tracking-[-0.5px] text-white">Aún no hay entradas</h3>
            <p className="text-sm text-white/50 font-body font-light mt-2 mb-6">Escribe tu primera entrada para empezar tu historia</p>
            <Link href="/diary/new" className="inline-flex items-center justify-center bg-white text-black rounded-full px-7 py-3 text-sm font-medium font-body hover:bg-white/90 transition-colors">
              ✨ Escribir primera entrada
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any, i: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any, delay: 0.14 + i * 0.06 }}
                className="liquid-glass rounded-[1.25rem] p-5 md:p-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl liquid-glass-strong flex items-center justify-center text-[22px] shrink-0">{MOOD_EMOJIS[entry.moodLevel as keyof typeof MOOD_EMOJIS]}</span>
                    <div>
                      <span className="font-heading italic text-[15px] leading-none text-white">{MOOD_LABELS[entry.moodLevel as keyof typeof MOOD_LABELS]}</span>
                      <p className="text-[11px] text-white/35 font-body mt-0.5">
                        {new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="font-body text-[14px] leading-[1.65] text-white/75">{entry.thought}</p>
                {entry.rationalThought && (
                  <div className="mt-4 liquid-glass-strong rounded-[1rem] p-4">
                    <p className="text-[11px] tracking-[0.14em] uppercase font-body font-medium text-emerald-400/90 mb-1.5">🧠 Pensamiento racional</p>
                    <p className="text-[13px] leading-relaxed text-white/70 font-body">{entry.rationalThought}</p>
                  </div>
                )}
                {entry.emotions && entry.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(typeof entry.emotions === 'string' ? JSON.parse(entry.emotions) : entry.emotions).map((em: string) => (
                      <span key={em} className="liquid-glass rounded-full px-3 py-1 text-[12px] font-medium font-body text-white/70">{em}</span>
                    ))}
                  </div>
                )}
                {entry.gratitude && (
                  <p className="text-xs text-white/40 font-body italic mt-3">✨ {entry.gratitude}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="text-center pt-8 mt-8 border-t border-white/[0.06]">
          <p className="text-[11px] tracking-wide text-white/30 font-body">💚 Tu diario es privado — solo tú puedes verlo</p>
        </motion.div>
      </div>
    </div>
  );
}
