'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadingVideo } from '@/components/fading-video';
import { BlurText } from '@/components/blur-text';
import { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon, ImageIcon, MovieIcon, LightbulbIcon } from '@/components/liquid-icons';

const fade = { initial: { filter: 'blur(10px)', opacity: 0, y: 20 } as any, animate: { filter: 'blur(0px)', opacity: 1, y: 0 } as any, transition: { duration: 0.8, ease: 'easeOut' as any } };

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { if (!isLoading && !user) router.push('/'); else if (user) { api.profile.get().then(setProfile).catch(()=>{}); api.profile.streak().catch(()=>{}); } }, [user, isLoading, router]);
  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 font-body text-sm">Cargando...</div>;
  if (!user) return null;
  return (
    <div className="bg-black font-body" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '-20px' }}>
      <section className="h-screen overflow-hidden bg-black relative">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4" className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0" style={{ width: '120%', height: '120%' }} />
        <div className="relative z-10 flex flex-col h-full">
          <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16">
            <div className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center font-heading italic text-2xl">a</div>
            <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1">
              <Link href="/diary" className="px-3 py-2 text-sm font-medium text-white/90 font-body">Diario</Link>
              <Link href="/exercises" className="px-3 py-2 text-sm font-medium text-white/90 font-body">Ejercicios</Link>
              <Link href="/community" className="px-3 py-2 text-sm font-medium text-white/90 font-body">Comunidad</Link>
              <Link href="/chat" className="px-3 py-2 text-sm font-medium text-white/90 font-body">Chat</Link>
              <Link href="/profile" className="px-3 py-2 text-sm font-medium text-white/90 font-body">Perfil</Link>
              <Link href="/diary/new" className="ml-1 bg-white text-black rounded-full px-5 py-2 text-sm font-medium flex items-center gap-1.5">Escribir <ArrowUpRight /></Link>
            </div>
            <div className="h-12 w-12" />
          </nav>
          <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
            <motion.div {...fade} transition={{ ...fade.transition, delay: 0.4 }} className="liquid-glass rounded-full px-2 py-1 flex items-center gap-2 text-sm">
              <span className="bg-white text-black rounded-full px-3 py-0.5 text-xs font-medium">Hola</span>
              <span className="text-white/90 pr-2">{profile?.nickname || user.nickname} — tu espacio seguro</span>
            </motion.div>
            <div className="mt-6 max-w-3xl"><BlurText text="Bienestar emocional diseñado para durar más allá de hoy" className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-4px]" /></div>
            <motion.p {...fade} transition={{ ...fade.transition, delay: 0.8 }} className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight">Somos un espacio seguro donde cuidamos tu mente con ciencia y calidez: diario guiado, ejercicios, comunidad y apoyo con IA.</motion.p>
            <motion.div {...fade} transition={{ ...fade.transition, delay: 1.1 }} className="mt-6 flex gap-6">
              <Link href="/diary/new" className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium">Escribir ahora <ArrowUpRight /></Link>
              <Link href="/exercises" className="flex items-center gap-2 text-sm font-medium"><span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><PlayIcon /></span> Ver ejercicios</Link>
            </motion.div>
            <motion.div {...fade} transition={{ ...fade.transition, delay: 1.3 }} className="mt-8 flex gap-4">
              <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left"><ClockIcon /><div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4">21 días</div><div className="text-xs text-white/70 mt-1 font-body">Para crear un hábito sostenible</div></div>
              <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left"><GlobeIcon /><div className="text-4xl font-heading italic tracking-[-1px] leading-none mt-4">24/7</div><div className="text-xs text-white/70 mt-1 font-body">Acompañamiento cuando lo necesites</div></div>
            </motion.div>
          </div>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 1.4 }} className="flex flex-col items-center gap-4 pb-8">
            <div className="liquid-glass rounded-full px-5 py-2 text-xs text-white/80">Confiado por quienes priorizan su bienestar</div>
            <div className="flex gap-12 md:gap-16">{['Calma','Equilibrio','Seren','Luz','Vive'].map(n=> <span key={n} className="font-heading italic text-2xl md:text-3xl tracking-tight">{n}</span>)}</div>
          </motion.div>
        </div>
      </section>
      <section className="min-h-screen overflow-hidden bg-black relative">
        <FadingVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
          <div className="mb-auto"><div className="text-sm font-body text-white/80 mb-6">// Capacidades</div><h2 className="font-heading italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">Cuidado<br/>integral,<br/>de principio a fin</h2></div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ImageIcon />, title: 'Diario', tags: ['Registro diario','Emociones','Reflexión','Hábito'], body: 'Un diario guiado que te ayuda a nombrar lo que sientes y encontrar claridad — con privacidad en cada entrada.', href: '/diary' },
              { icon: <MovieIcon />, title: 'Ejercicios', tags: ['TCC','Mindfulness','Respiración','Sueño'], body: 'Prácticas breves y efectivas basadas en evidencia, con guía y seguimiento a tu ritmo.', href: '/exercises' },
              { icon: <LightbulbIcon />, title: 'Comunidad', tags: ['Apoyo','Chat IA','Anónimo','Crecimiento'], body: 'Comunidad moderada y chat de apoyo para convertir un buen día en bienestar que se acumula.', href: '/community' },
            ].map(c=> (
              <Link key={c.title} href={c.href} className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between gap-2"><div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0">{c.icon}</div><div className="flex flex-wrap gap-1.5 justify-end">{c.tags.map(t=> <span key={t} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">{t}</span>)}</div></div>
                <div className="flex-1" /><div className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none mt-6">{c.title}</div><p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">{c.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
