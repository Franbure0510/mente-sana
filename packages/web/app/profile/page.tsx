'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

const HELPLINES = [
  { flag: '🇪🇺', country: 'Unión Europea', numbers: [{ name: 'Número único de emergencia', phone: '112' }, { name: 'Línea de apoyo emocional', phone: '116 123' }] },
  { flag: '🌎', country: 'Internacional', numbers: [{ name: 'Línea de Prevención del Suicidio', phone: '📞 +1 (800) 273-8255 / 📱 741741' }, { name: 'Befrienders Worldwide', phone: 'befrienders.org' }] },
  { flag: '🇦🇷', country: 'Argentina', numbers: [{ name: 'Línea de Salud Mental', phone: '135' }, { name: 'SOS Un Amigo Anónimo', phone: '4783-8888' }] },
  { flag: '🇧🇴', country: 'Bolivia', numbers: [{ name: 'Línea de Crisis', phone: '156' }] },
  { flag: '🇨🇱', country: 'Chile', numbers: [{ name: 'Salud Responde', phone: '600 360 7777' }, { name: 'Todo Mejora', phone: '22 20 89 787' }] },
  { flag: '🇨🇴', country: 'Colombia', numbers: [{ name: 'Línea Nacional de Salud Mental', phone: '01-8000-113-113' }, { name: 'Línea Amiga', phone: '123' }] },
  { flag: '🇨🇷', country: 'Costa Rica', numbers: [{ name: 'Línea de Crisis', phone: '9-1-1' }, { name: 'Aquí Estoy', phone: '2272-3774' }] },
  { flag: '🇨🇺', country: 'Cuba', numbers: [{ name: 'Línea de Ayuda', phone: '103' }] },
  { flag: '🇪🇨', country: 'Ecuador', numbers: [{ name: 'Línea de Crisis', phone: '171' }] },
  { flag: '🇸🇻', country: 'El Salvador', numbers: [{ name: 'Línea de Crisis', phone: '911' }] },
  { flag: '🇪🇸', country: 'España', numbers: [{ name: 'Línea 024 (Suicidio)', phone: '024' }, { name: 'Teléfono de la Esperanza', phone: '717 003 717' }] },
  { flag: '🇺🇸', country: 'Estados Unidos', numbers: [{ name: '988 Suicide & Crisis Lifeline', phone: '988' }, { name: 'Crisis Text Line', phone: '741741' }] },
  { flag: '🇬🇹', country: 'Guatemala', numbers: [{ name: 'Línea de Crisis', phone: '1546' }] },
  { flag: '🇭🇳', country: 'Honduras', numbers: [{ name: 'Línea de Crisis', phone: '911' }] },
  { flag: '🇲🇽', country: 'México', numbers: [{ name: 'Línea de la Vida', phone: '800 911 2000' }, { name: 'SAPPTEL', phone: '55 5259-8121' }] },
  { flag: '🇳🇮', country: 'Nicaragua', numbers: [{ name: 'Línea de Crisis', phone: '133' }] },
  { flag: '🇵🇦', country: 'Panamá', numbers: [{ name: 'Línea de Crisis', phone: '169' }] },
  { flag: '🇵🇾', country: 'Paraguay', numbers: [{ name: 'Línea de Crisis', phone: '911' }] },
  { flag: '🇵🇪', country: 'Perú', numbers: [{ name: 'Línea 113', phone: '113' }, { name: 'Línea de Crisis', phone: '0800-4-0800' }] },
  { flag: '🇵🇷', country: 'Puerto Rico', numbers: [{ name: 'Línea PAS', phone: '1-800-981-0023' }] },
  { flag: '🇩🇴', country: 'República Dominicana', numbers: [{ name: 'Línea de Crisis', phone: '809-200-1202' }] },
  { flag: '🇺🇾', country: 'Uruguay', numbers: [{ name: 'Línea de Crisis', phone: '0800 87 87' }] },
  { flag: '🇻🇪', country: 'Venezuela', numbers: [{ name: 'Línea de Crisis', phone: '911' }] },
  { flag: '🇩🇪', country: 'Alemania', numbers: [{ name: 'Telefonseelsorge', phone: '0800 111 0 111' }] },
  { flag: '🇫🇷', country: 'Francia', numbers: [{ name: 'SOS Amitié', phone: '09 72 39 40 50' }] },
  { flag: '🇬🇧', country: 'Reino Unido', numbers: [{ name: 'Samaritans', phone: '116 123' }] },
];

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showHelplines, setShowHelplines] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.profile.get().then(setProfile).catch(() => {});
    api.profile.resources().then(setResources).catch(() => {});
  }, [user, isLoading, router]);

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  const isPremium = profile?.subscription === 'premium_monthly' || profile?.subscription === 'premium_annual';

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[720px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="text-center mb-8">
          <div className="liquid-glass-strong w-20 h-20 rounded-[1.25rem] inline-flex items-center justify-center text-3xl mb-4">👤</div>
          <h1 className="font-heading italic text-[2.2rem] md:text-[2.8rem] leading-none tracking-[-1px] text-white">{profile?.nickname || user.nickname}</h1>
          <p className="text-sm text-white/40 font-body mt-2">{user.email}</p>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { emoji: '🔥', value: profile?.streakDays || 0, label: 'días seguidos' },
            { emoji: '📖', value: profile?.diaryCount || 0, label: 'entradas' },
            { emoji: '🧘', value: profile?.exerciseCount || 0, label: 'ejercicios' },
          ].map(s => (
            <div key={s.label} className="liquid-glass rounded-[1.25rem] p-5 md:p-6 text-center">
              <div className="font-heading italic text-[1.9rem] leading-none text-white">{s.value}</div>
              <div className="text-[11px] tracking-[0.08em] uppercase text-white/40 font-body mt-2">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.14 }}>
          <Link href="/subscribe" className="block mb-6 group">
            <div className={`${isPremium ? 'liquid-glass-strong' : 'liquid-glass'} rounded-[1.25rem] p-5 md:p-6 flex items-center gap-4 group-hover:scale-[1.01] transition-transform`}>
              <div className="w-11 h-11 rounded-xl liquid-glass flex items-center justify-center text-xl shrink-0">{isPremium ? '👑' : '⭐'}</div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-heading italic text-[1.15rem] leading-none ${isPremium ? 'text-amber-300' : 'text-white'}`}>{profile?.subscription === 'premium_annual' ? 'Plan Premium Anual' : profile?.subscription === 'premium_monthly' ? 'Plan Premium Mensual' : 'Plan Gratuito'}</h3>
                <p className="text-xs text-white/45 font-body mt-1.5 truncate">{isPremium ? 'Disfrutas de todos los beneficios ✨' : 'Actualiza para funciones ilimitadas'}</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform shrink-0">→</span>
            </div>
          </Link>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }} className="mb-6">
          <p className="text-[11px] tracking-[0.16em] uppercase text-white/35 font-body mb-3">Recursos de ayuda</p>
          <div className="space-y-2.5">
            {resources.length === 0 && <div className="liquid-glass rounded-[1.25rem] p-6 text-center text-sm text-white/30 font-body">Cargando recursos...</div>}
            {resources.map((r: any) => (
              <button key={r.id} onClick={() => setSelected(r)} className="w-full text-left liquid-glass rounded-[1.25rem] p-4 md:p-5 flex items-start gap-3.5 hover:scale-[1.005] transition-transform cursor-pointer">
                <span className="w-10 h-10 rounded-xl liquid-glass-strong flex items-center justify-center text-lg shrink-0">{r.category === 'article' ? '📄' : r.category === 'video' ? '🎬' : '🎵'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[13.5px] text-white font-body leading-tight">{r.title}</h3>
                  <p className="text-xs text-white/40 font-body mt-1 line-clamp-2">{r.description}</p>
                </div>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-wide text-white/60 font-body shrink-0">{r.category}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }} className="mb-6">
          <button onClick={() => setShowHelplines(true)} className="w-full text-left liquid-glass rounded-[1.25rem] p-5 md:p-6 flex gap-4 items-start hover:scale-[1.005] transition-transform cursor-pointer border-white/10">
            <span className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-lg shrink-0">🚨</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading italic text-[1.1rem] leading-none text-red-400">Líneas de ayuda</h3>
              <p className="text-xs text-white/45 font-body mt-1.5">Si estás pasando por una crisis, contacta ayuda profesional inmediatamente.</p>
              <p className="text-xs font-semibold text-red-400 font-body mt-2">Haz click para ver el número de tu país →</p>
            </div>
          </button>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.26 }}>
          <button onClick={logout} className="w-full liquid-glass rounded-full py-3.5 text-sm font-medium text-white/60 hover:text-white font-body cursor-pointer transition-colors">
            Cerrar sesión
          </button>
          <p className="text-center text-[11px] text-white/20 font-body mt-3">Tu información es anónima y segura</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(8px)' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }} onClick={e => e.stopPropagation()} className="relative liquid-glass-strong rounded-[1.25rem] p-6 md:p-8 max-w-[560px] w-full max-h-[85vh] overflow-y-auto">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/50 hover:text-white text-sm cursor-pointer">✕</button>
              <div className="flex gap-3 mb-5 pr-8">
                <span className="w-11 h-11 rounded-xl liquid-glass flex items-center justify-center text-xl shrink-0">{selected.category === 'article' ? '📄' : selected.category === 'video' ? '🎬' : '🎵'}</span>
                <div>
                  <h2 className="font-heading italic text-xl leading-tight text-white">{selected.title}</h2>
                  <span className="liquid-glass rounded-full px-2.5 py-1 text-[10px] text-white/60 inline-block mt-2">{selected.category}</span>
                </div>
              </div>
              {selected.category === 'video' && selected.url && selected.url !== '#' && (
                <div className="mb-5 rounded-[1rem] overflow-hidden liquid-glass p-1">
                  <iframe src={selected.url} width="100%" height="280" className="border-0 rounded-[0.9rem] w-full" allowFullScreen />
                </div>
              )}
              {selected.category === 'audio' && selected.url && selected.url !== '#' && (
                <div className="mb-5 rounded-[1rem] overflow-hidden liquid-glass p-1">
                  <iframe src={selected.url} width="100%" height="200" className="border-0 rounded-[0.9rem] w-full" allowFullScreen />
                </div>
              )}
              <div className="text-[13.5px] leading-[1.8] text-white/75 font-body whitespace-pre-wrap">{selected.content || 'Contenido próximamente...'}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelplines && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" onClick={() => setShowHelplines(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as any }} onClick={e => e.stopPropagation()} className="relative liquid-glass-strong rounded-[1.25rem] p-6 md:p-7 max-w-[640px] w-full max-h-[85vh] overflow-y-auto">
              <button onClick={() => setShowHelplines(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/50 hover:text-white text-sm cursor-pointer">✕</button>
              <div className="flex gap-3 mb-6 pr-8">
                <span className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-xl">🚨</span>
                <div>
                  <h2 className="font-heading italic text-xl leading-none text-white">Líneas de crisis</h2>
                  <p className="text-xs text-white/45 font-body mt-1.5">Disponibles 24/7 — ayuda gratuita y confidencial</p>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
                {HELPLINES.map(c => (
                  <div key={c.country} className="liquid-glass rounded-[1rem] p-3.5">
                    <div className="font-medium text-[13px] text-white font-body mb-2">{c.flag} {c.country}</div>
                    {c.numbers.map((n, i) => (
                      <div key={i} className="flex justify-between gap-4 text-xs font-body py-1">
                        <span className="text-white/50">{n.name}</span>
                        <span className="text-red-400 font-semibold whitespace-nowrap">{n.phone}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-white/30 font-body mt-5">No estás solo. Siempre hay alguien dispuesto a escucharte 💙</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
