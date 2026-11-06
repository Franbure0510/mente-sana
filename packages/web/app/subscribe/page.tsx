'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';

const PRICING = {
  monthly: { price: 9.99, label: '/mes', subId: 'premium_monthly', yearlyTotal: undefined as number | undefined },
  annual: { price: 4.99, label: '/mes', subId: 'premium_annual', yearlyTotal: 59.99 },
};

const BENEFITS = [
  'Todos los ejercicios (avanzados incluidos)',
  'Chat asistente ILIMITADO con IA',
  'Recomendaciones personalizadas',
  'Estadísticas y progreso detallado',
  'Recursos completos: videos y audios',
  'Robot con expresiones avanzadas',
  'Sin límites en el diario',
  'Acceso prioritario a nuevas funciones',
];

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' } as any,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as any,
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
};

export default function SubscribePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<string>('free');
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const p = PRICING[period];
  const isPremium = sub === 'premium_monthly' || sub === 'premium_annual';

  useEffect(() => {
    if (!isLoading && !user) { router.push('/'); return; }
    if (!user) return;
    api.profile.subscription().then(r => setSub(r.subscription)).catch(() => {});
  }, [user, isLoading, router]);

  const handleUpgrade = async () => {
    setLoading(true);
    setMsg('');
    try {
      const r = await api.subscription.createCheckout(period);
      window.location.href = r.url;
    } catch (e: any) {
      setMsg(e.message || 'Error al iniciar el pago. ¿Stripe está configurado?');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await api.subscription.cancel();
      setSub('free');
      setMsg('Suscripción cancelada. Seguirás teniendo acceso hasta el final del período.');
      setTimeout(() => setMsg(''), 4000);
    } catch { setMsg('Error al cancelar'); }
    setLoading(false);
  };

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="bg-black font-body relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px', minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-6 md:px-8 pt-10 pb-28">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="text-center mb-8">
          <div className="liquid-glass w-14 h-14 rounded-[1rem] inline-flex items-center justify-center text-2xl mb-4">⭐</div>
          <h1 className="font-heading italic text-[2.4rem] md:text-[3rem] leading-none tracking-[-1.2px] text-white">{isPremium ? 'Eres Premium' : 'Desbloquea todo'}</h1>
          <p className="font-heading italic text-lg md:text-xl text-white/60 tracking-[-0.3px] -mt-1">{isPremium ? 'gracias por confiar' : 'tu viaje de bienestar'}</p>
          <p className="text-sm text-white/40 font-body font-light mt-3 max-w-[44ch] mx-auto">{isPremium ? 'Gracias por confiar en Mente Sana. Disfruta de todos los beneficios.' : 'Elige el plan que mejor se adapte a ti y comienza hoy.'}</p>
        </motion.div>

        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }} className="liquid-glass-strong rounded-[1rem] px-5 py-3.5 text-center text-sm text-emerald-300 font-body mb-6">
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="flex justify-center mb-8">
          <div className="liquid-glass rounded-full p-1.5 flex gap-1">
            {(['monthly', 'annual'] as const).map(per => (
              <button key={per} onClick={() => !isPremium && setPeriod(per)} className={`relative rounded-full px-6 py-2 text-xs font-medium font-body cursor-pointer transition-all ${period === per && !isPremium ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'} ${isPremium ? 'cursor-default' : ''}`}>
                {per === 'monthly' ? 'Mensual' : 'Anual'}
                {per === 'annual' && <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-full">AHORRA 50%</span>}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.14 }} className="grid md:grid-cols-2 gap-4 md:gap-5 items-start">
          <div className={`${sub === 'free' ? 'liquid-glass-strong border-white/15' : 'liquid-glass'} rounded-[1.25rem] p-6 md:p-7 relative overflow-hidden`}>
            {sub === 'free' && <span className="absolute top-3 right-3 liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-wide text-white/60 font-body">Activo</span>}
            <div className="w-11 h-11 rounded-xl liquid-glass flex items-center justify-center text-xl mb-4">💚</div>
            <h2 className="font-heading italic text-[1.5rem] leading-none tracking-[-0.5px] text-white">Gratuito</h2>
            <div className="mt-3 mb-5">
              <span className="font-heading italic text-[2rem] leading-none text-white">$0</span>
              <span className="text-sm text-white/30 font-body ml-2">siempre</span>
            </div>
            <div className="space-y-2.5 mb-6">
              {['Ejercicios básicos de respiración', 'Diario personal', 'Acceso a la comunidad', 'Chat con respuestas limitadas', 'Recursos básicos'].map(f => (
                <div key={f} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full liquid-glass flex items-center justify-center text-[10px] text-white/70 shrink-0 mt-0.5">✓</span>
                  <span className="text-[13px] leading-[1.4] text-white/60 font-body">{f}</span>
                </div>
              ))}
            </div>
            {sub === 'free' ? (
              <div className="w-full liquid-glass rounded-full py-3 text-center text-xs font-semibold text-white/40 font-body">✓ Plan activo</div>
            ) : (
              <button onClick={handleCancel} disabled={loading} className="w-full liquid-glass rounded-full py-3 text-sm font-medium text-white/60 hover:text-white font-body cursor-pointer disabled:opacity-50">
                Cancelar Premium
              </button>
            )}
          </div>

          <div className={`${isPremium ? 'liquid-glass-strong border-amber-300/20' : 'liquid-glass-strong'} rounded-[1.25rem] p-6 md:p-7 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold tracking-widest px-4 py-1 rounded-bl-[1rem]">POPULAR</div>
            <div className="w-11 h-11 rounded-xl liquid-glass flex items-center justify-center text-xl mb-4">👑</div>
            <h2 className="font-heading italic text-[1.5rem] leading-none tracking-[-0.5px] text-white">Premium</h2>
            <div className="mt-3 mb-1">
              <span className="font-heading italic text-[2rem] leading-none text-white">${p.price}</span>
              <span className="text-sm text-white/30 font-body ml-2">{p.label}</span>
            </div>
            {period === 'annual' && <p className="text-[11px] text-white/35 font-body mb-1">${p.yearlyTotal!} facturados anualmente</p>}
            {period === 'annual' && <div className="inline-flex liquid-glass rounded-full px-2.5 py-1 text-[11px] font-medium text-emerald-300 font-body mb-4">Ahorras ${(PRICING.monthly.price * 12 - p.yearlyTotal!).toFixed(2)} al año</div>}
            {period !== 'annual' && <div className="mb-4" />}
            <div className="space-y-2.5 mb-6">
              {BENEFITS.map(f => (
                <div key={f} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span className="text-[13px] leading-[1.4] text-white/75 font-body">{f}</span>
                </div>
              ))}
            </div>
            {isPremium ? (
              <div className="w-full bg-white/10 rounded-full py-3 text-center text-xs font-semibold text-white/50 font-body">✓ Plan activo</div>
            ) : (
              <button onClick={handleUpgrade} disabled={loading} className="w-full bg-white text-black rounded-full py-3.5 text-sm font-semibold font-body hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-60">
                {loading ? 'Procesando...' : `Suscribirse — $${p.price}${p.label}`}
              </button>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mt-8 liquid-glass rounded-[1.25rem] p-4 text-center">
          <p className="text-xs text-white/30 font-body">💳 Pago seguro vía Stripe · Cancela cuando quieras · Sin compromiso · Prueba gratuita 7 días</p>
        </motion.div>
      </div>
    </div>
  );
}
