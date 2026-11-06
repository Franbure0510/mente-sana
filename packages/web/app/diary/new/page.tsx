'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MOOD_EMOJIS, MOOD_LABELS, EMOTIONS } from '@mentesana/shared';
import { motion } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function NewDiaryEntry() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [moodLevel, setMoodLevel] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [rationalThought, setRationalThought] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) { router.push('/'); return null; }

  const toggleEmotion = (id: string) => {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.diary.create({ moodLevel, emotions: selectedEmotions, thought, rationalThought, gratitude });
      router.push('/diary');
    } catch { alert('Error al guardar. Intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto px-6 md:px-8 pt-8 pb-28">
        <motion.button {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.04 }} onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 font-body mb-6 transition-colors cursor-pointer">
          <span className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-xs">←</span> Volver al diario
        </motion.button>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="mb-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/40 font-body mb-2">Nueva entrada · Momento presente</p>
          <h1 className="font-heading italic text-[2.2rem] md:text-[2.7rem] leading-[0.9] tracking-[-1.2px] text-white">Nueva entrada</h1>
          <p className="text-sm text-white/50 font-body font-light mt-2">Tómate un momento para ti — sin prisa, sin juicio</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.14 }} className="liquid-glass-strong rounded-[1.25rem] p-6 md:p-7">
            <p className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body font-medium mb-4">¿Cómo te sientes hoy?</p>
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMoodLevel(n)}
                  className={`rounded-[1rem] py-3.5 md:py-4 flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${moodLevel === n ? 'liquid-glass-strong scale-[1.03] border-white/20' : 'liquid-glass border-transparent hover:border-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-[26px] md:text-[30px] leading-none">{MOOD_EMOJIS[n as keyof typeof MOOD_EMOJIS]}</span>
                  <span className="text-[11px] font-medium font-body tracking-wide" style={{ color: moodLevel === n ? '#fff' : 'rgba(255,255,255,0.45)' }}>{MOOD_LABELS[n as keyof typeof MOOD_LABELS]}</span>
                  {moodLevel === n && <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] mt-0.5" />}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }} className="liquid-glass-strong rounded-[1.25rem] p-6 md:p-7">
            <p className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body font-medium mb-4">Emociones que identificas</p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(em => {
                const active = selectedEmotions.includes(em.id);
                return (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => toggleEmotion(em.id)}
                    className={`rounded-full px-4 py-2 text-[13px] font-body font-medium transition-all cursor-pointer border ${active ? 'bg-white text-black border-white' : 'liquid-glass text-white/60 hover:text-white border-transparent hover:border-white/10'}`}
                  >
                    {em.emoji} {em.name}
                  </button>
                );
              })}
            </div>
            {selectedEmotions.length > 0 && (
              <p className="text-xs text-white/35 font-body mt-3">{selectedEmotions.length} seleccionada{selectedEmotions.length !== 1 ? 's' : ''}</p>
            )}
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }} className="liquid-glass-strong rounded-[1.25rem] p-6 md:p-7">
            <label className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body font-medium mb-3 block">¿Qué pensamiento tienes en mente?</label>
            <textarea
              value={thought}
              onChange={e => setThought(e.target.value)}
              className="w-full min-h-[110px] bg-white/[0.04] border border-white/10 rounded-[1rem] px-4 py-3.5 text-[14px] leading-relaxed text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none resize-y font-body"
              placeholder="Escribe lo que estás pensando..."
              required
            />
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.26 }} className="liquid-glass rounded-[1.25rem] p-6 md:p-7">
            <label className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body font-medium mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg liquid-glass flex items-center justify-center text-xs">🧠</span> Perspectiva más equilibrada <span className="normal-case tracking-normal text-white/25 text-xs">(opcional)</span>
            </label>
            <textarea
              value={rationalThought}
              onChange={e => setRationalThought(e.target.value)}
              className="w-full min-h-[88px] bg-white/[0.04] border border-white/10 rounded-[1rem] px-4 py-3.5 text-[14px] leading-relaxed text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none resize-y font-body"
              placeholder="Reestructura tu pensamiento de forma más objetiva..."
            />
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.30 }} className="liquid-glass rounded-[1.25rem] p-6 md:p-7">
            <label className="text-[11px] tracking-[0.14em] uppercase text-white/40 font-body font-medium mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg liquid-glass flex items-center justify-center text-xs">✨</span> ¿Por qué estás agradecido hoy? <span className="normal-case tracking-normal text-white/25 text-xs">(opcional)</span>
            </label>
            <textarea
              value={gratitude}
              onChange={e => setGratitude(e.target.value)}
              className="w-full min-h-[70px] bg-white/[0.04] border border-white/10 rounded-[1rem] px-4 py-3.5 text-[14px] leading-relaxed text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none resize-y font-body"
              placeholder="Tres cosas por las que estás agradecido..."
            />
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.34 }} className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-white text-black rounded-full py-4 font-medium text-[15px] font-body hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Guardando...' : '💾 Guardar entrada'}
            </button>
            <p className="text-center text-[11px] text-white/25 font-body mt-3">Tu entrada es privada y segura</p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
