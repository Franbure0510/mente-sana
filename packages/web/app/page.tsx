'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function ArrowRight({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isLoading && user) router.push('/dashboard'); }, [user, isLoading, router]);
  if (isLoading) return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'rgba(255,255,255,0.5)' }}>Cargando...</div>;
  if (user) return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>Redirigiendo...</div>;
  return (
    <div className="fixed inset-0 h-screen w-screen bg-black p-3 md:p-4 font-inter z-40 overflow-hidden">
      <div className="w-full h-full rounded-2xl flex flex-col overflow-hidden relative bg-black">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover anim-fade" style={{ animationDelay: '0.2s' }} src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4" />
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <div className="anim-stagger flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>🌿</div>
            <span className="text-white text-[10px] md:text-xs tracking-[0.35em] mt-2 font-light">M E N T E &ensp; S A N A</span>
          </div>
          <div className="anim-stagger flex items-center gap-3" style={{ animationDelay: '0.2s' }}>
            <Link href="/login" className="hidden md:block px-5 py-2.5 text-white text-sm hover:bg-white/10 btn-cut-border transition-colors"><span>Iniciar Sesión</span></Link>
            <Link href="/register" className="hidden md:block px-5 py-2.5 bg-white text-black text-sm hover:bg-white/90 btn-cut transition-colors">Comenzar Gratis</Link>
          </div>
        </nav>
        <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-10 pb-8 md:pb-10">
          <div className="flex-1 flex items-center relative">
            <div className="anim-stagger hidden lg:flex flex-col gap-6 absolute left-0 top-[18%]" style={{ animationDelay: '0.4s' }}>
              <p className="text-white/80 text-base leading-relaxed max-w-[220px]">Ven con nosotros<br />explorando tu<br />bienestar interior</p>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border border-white/40" /><div className="w-4 h-4 rounded-full border border-white/40" /></div>
                <div className="flex items-center gap-2 mt-2"><span className="text-white/70 text-xs">Calma<br />Presente</span><span className="text-white/50 text-xs">01</span></div>
              </div>
            </div>
            <div className="anim-stagger w-full text-center" style={{ animationDelay: '0.5s' }}>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-[1.1] tracking-[-0.04em]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                Cultiva tu Paz<br />Encuentra tu Equilibrio<br />Mente Sana
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-8">
            <div className="anim-stagger flex items-center justify-center md:justify-end" style={{ animationDelay: '0.7s' }}>
              <p className="text-white text-sm leading-relaxed max-w-[260px] text-center md:text-left md:ml-auto">Tu espacio seguro para el bienestar emocional — diario, ejercicios y comunidad, cuando lo necesites.</p>
            </div>
            <div className="anim-stagger flex flex-col items-center gap-8 md:gap-24" style={{ animationDelay: '0.85s' }}>
              <span className="text-white text-2xl md:text-3xl font-medium">Bienestar Diario</span>
              <Link href="/register" className="w-full max-w-[280px] py-3.5 bg-white flex items-center justify-center gap-2 text-black hover:bg-white/90 transition-colors group btn-cut">
                <span className="text-sm font-medium">Comenzar Ahora</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="anim-stagger flex items-center justify-center md:justify-end gap-3" style={{ animationDelay: '1s' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.735a5.96 5.96 0 00-2.144 1.384A5.96 5.96 0 00.612 4.263c-.402.765-.603 1.635-.663 2.913C-.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.278.261 2.148.663 2.913a5.96 5.96 0 001.384 2.144 5.96 5.96 0 002.144 1.384c.765.402 1.635.603 2.913.663C8.333 23.985 8.74 24 12 24s3.667-.015 4.947-.072c1.278-.06 2.148-.261 2.913-.663a5.96 5.96 0 002.144-1.384 5.96 5.96 0 001.384-2.144c.402-.765.603-1.635.663-2.913.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.278-.261-2.148-.663-2.913a5.96 5.96 0 00-1.384-2.144 5.96 5.96 0 00-2.144-1.384c-.765-.402-1.635-.603-2.913-.663C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.012 4.85.07 1.17.054 1.805.249 2.227.415.562.217.96.477 1.38.896.419.42.679.818.896 1.38.166.422.361 1.057.415 2.227.058 1.265.07 1.647.07 4.85s-.012 3.585-.07 4.85c-.054 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.38-.42.419-.818.679-1.38.896-.422.166-1.057.361-2.227.415-1.265.058-1.647.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.415a3.8 3.8 0 01-1.38-.896 3.8 3.8 0 01-.896-1.38c-.166-.422-.361-1.057-.415-2.227-.058-1.265-.07-1.647-.07-4.85s.012-3.585.07-4.85c.054-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.38.42-.419.818-.679 1.38-.896.422-.166 1.057-.361 2.227-.415 1.265-.058 1.647-.07 4.85-.07zm0 3.678a5.962 5.962 0 100 11.924 5.962 5.962 0 000-11.924zm0 9.764a3.802 3.802 0 110-7.604 3.802 3.802 0 010 7.604zm6.406-9.97a1.393 1.393 0 11-2.786 0 1.393 1.393 0 012.786 0z" /></svg></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-10 h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
